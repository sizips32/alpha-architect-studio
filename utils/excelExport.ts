import type { BacktestResults, Config, Trade } from '../types';

interface ExportOptions {
  results: BacktestResults;
  expression: string;
  config: Config;
}

/**
 * Generate Excel report for backtest results
 * Uses HTML table format that Excel can open
 */
export function exportToExcel({ results, expression, config }: ExportOptions): void {
  const { kpis, pnlData, benchmark, trades } = results;

  // Calculate additional statistics
  const startValue = pnlData[0]?.value ?? 1000;
  const endValue = pnlData[pnlData.length - 1]?.value ?? 1000;
  const totalReturn = ((endValue - startValue) / startValue) * 100;
  const benchmarkReturn = benchmark?.return ?? 0;
  const alpha = totalReturn - benchmarkReturn;

  // Calculate monthly returns
  const monthlyReturns: { month: string; return: number }[] = [];
  const daysPerMonth = 21;
  for (let i = 0; i < pnlData.length; i += daysPerMonth) {
    const startIdx = i;
    const endIdx = Math.min(i + daysPerMonth - 1, pnlData.length - 1);
    const startVal = pnlData[startIdx].value;
    const endVal = pnlData[endIdx].value;
    const monthReturn = ((endVal - startVal) / startVal) * 100;
    monthlyReturns.push({ month: `M${Math.floor(i / daysPerMonth) + 1}`, return: monthReturn });
  }

  // Calculate drawdown
  let peak = pnlData[0].value;
  const drawdownData = pnlData.map((d) => {
    if (d.value > peak) peak = d.value;
    return ((d.value - peak) / peak) * 100;
  });
  const maxDrawdown = Math.min(...drawdownData);
  const avgDrawdown = drawdownData.reduce((a, b) => a + b, 0) / drawdownData.length;

  // Calculate sector statistics
  const sectorStats = new Map<
    string,
    { trades: number; buys: number; sells: number; totalAmount: number; totalPnl: number }
  >();
  trades?.forEach((t) => {
    const existing = sectorStats.get(t.sector) || {
      trades: 0,
      buys: 0,
      sells: 0,
      totalAmount: 0,
      totalPnl: 0,
    };
    existing.trades++;
    if (t.action === 'BUY') existing.buys++;
    else existing.sells++;
    existing.totalAmount += t.amount;
    existing.totalPnl += t.pnl || 0;
    sectorStats.set(t.sector, existing);
  });

  // Format date
  const now = new Date();
  const dateStr = now.toLocaleDateString('ko-KR');

  // Generate Excel XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1" ss:Size="12"/>
      <Interior ss:Color="#0891b2" ss:Pattern="Solid"/>
      <Font ss:Color="#FFFFFF"/>
    </Style>
    <Style ss:ID="SubHeader">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#f1f5f9" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Positive">
      <Font ss:Color="#10b981"/>
    </Style>
    <Style ss:ID="Negative">
      <Font ss:Color="#ef4444"/>
    </Style>
    <Style ss:ID="Number">
      <NumberFormat ss:Format="#,##0.00"/>
    </Style>
    <Style ss:ID="Percent">
      <NumberFormat ss:Format="0.00%"/>
    </Style>
  </Styles>

  <!-- Summary Sheet -->
  <Worksheet ss:Name="요약">
    <Table>
      <Column ss:Width="150"/>
      <Column ss:Width="150"/>
      <Row>
        <Cell ss:StyleID="Header"><Data ss:Type="String">백테스트 리포트</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">${dateStr}</Data></Cell>
      </Row>
      <Row><Cell/></Row>
      <Row>
        <Cell ss:StyleID="SubHeader"><Data ss:Type="String">알파 수식</Data></Cell>
        <Cell><Data ss:Type="String">${expression}</Data></Cell>
      </Row>
      <Row><Cell/></Row>
      <Row>
        <Cell ss:StyleID="SubHeader"><Data ss:Type="String">성과 요약</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">총 수익률</Data></Cell>
        <Cell><Data ss:Type="Number">${(totalReturn / 100).toFixed(4)}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">${benchmark?.name ?? '벤치마크'} 수익률</Data></Cell>
        <Cell><Data ss:Type="Number">${(benchmarkReturn / 100).toFixed(4)}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">알파 (초과수익)</Data></Cell>
        <Cell><Data ss:Type="Number">${(alpha / 100).toFixed(4)}</Data></Cell>
      </Row>
      <Row><Cell/></Row>
      <Row>
        <Cell ss:StyleID="SubHeader"><Data ss:Type="String">KPI</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">정보비율 (IR)</Data></Cell>
        <Cell><Data ss:Type="Number">${kpis.ir}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">연간 수익률</Data></Cell>
        <Cell><Data ss:Type="Number">${kpis.annualReturn / 100}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">최대 낙폭</Data></Cell>
        <Cell><Data ss:Type="Number">${kpis.maxDrawdown / 100}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">턴오버 (일간)</Data></Cell>
        <Cell><Data ss:Type="Number">${kpis.turnover / 100}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">마진 (bps)</Data></Cell>
        <Cell><Data ss:Type="Number">${kpis.margin * 10000}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">상관관계</Data></Cell>
        <Cell><Data ss:Type="Number">${kpis.correlation}</Data></Cell>
      </Row>
      <Row><Cell/></Row>
      <Row>
        <Cell ss:StyleID="SubHeader"><Data ss:Type="String">설정</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">유니버스</Data></Cell>
        <Cell><Data ss:Type="String">${config.universe}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">지역</Data></Cell>
        <Cell><Data ss:Type="String">${config.region}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">딜레이</Data></Cell>
        <Cell><Data ss:Type="Number">${config.delay}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">룩백 기간</Data></Cell>
        <Cell><Data ss:Type="Number">${config.lookbackDays}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">최대 종목 비중</Data></Cell>
        <Cell><Data ss:Type="Number">${config.maxStockWeight}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">디케이</Data></Cell>
        <Cell><Data ss:Type="Number">${config.decay}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">중립화</Data></Cell>
        <Cell><Data ss:Type="String">${config.neutralization}</Data></Cell>
      </Row>
    </Table>
  </Worksheet>

  <!-- PnL Data Sheet -->
  <Worksheet ss:Name="PnL 데이터">
    <Table>
      <Column ss:Width="80"/>
      <Column ss:Width="120"/>
      <Column ss:Width="120"/>
      <Column ss:Width="100"/>
      <Row>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Day</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">포트폴리오</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">${benchmark?.name ?? '벤치마크'}</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">낙폭 (%)</Data></Cell>
      </Row>
      ${pnlData
        .map(
          (d, i) => `
      <Row>
        <Cell><Data ss:Type="Number">${d.day}</Data></Cell>
        <Cell><Data ss:Type="Number">${d.value.toFixed(2)}</Data></Cell>
        <Cell><Data ss:Type="Number">${benchmark?.data[i]?.value.toFixed(2) ?? ''}</Data></Cell>
        <Cell><Data ss:Type="Number">${drawdownData[i].toFixed(2)}</Data></Cell>
      </Row>`
        )
        .join('')}
    </Table>
  </Worksheet>

  <!-- Monthly Returns Sheet -->
  <Worksheet ss:Name="월별 수익률">
    <Table>
      <Column ss:Width="80"/>
      <Column ss:Width="120"/>
      <Row>
        <Cell ss:StyleID="Header"><Data ss:Type="String">월</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">수익률 (%)</Data></Cell>
      </Row>
      ${monthlyReturns
        .map(
          (m) => `
      <Row>
        <Cell><Data ss:Type="String">${m.month}</Data></Cell>
        <Cell><Data ss:Type="Number">${m.return.toFixed(2)}</Data></Cell>
      </Row>`
        )
        .join('')}
      <Row><Cell/></Row>
      <Row>
        <Cell ss:StyleID="SubHeader"><Data ss:Type="String">통계</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">수익 월</Data></Cell>
        <Cell><Data ss:Type="Number">${monthlyReturns.filter((m) => m.return > 0).length}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">손실 월</Data></Cell>
        <Cell><Data ss:Type="Number">${monthlyReturns.filter((m) => m.return < 0).length}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">평균</Data></Cell>
        <Cell><Data ss:Type="Number">${(monthlyReturns.reduce((a, b) => a + b.return, 0) / monthlyReturns.length).toFixed(2)}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">최고</Data></Cell>
        <Cell><Data ss:Type="Number">${Math.max(...monthlyReturns.map((m) => m.return)).toFixed(2)}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">최저</Data></Cell>
        <Cell><Data ss:Type="Number">${Math.min(...monthlyReturns.map((m) => m.return)).toFixed(2)}</Data></Cell>
      </Row>
    </Table>
  </Worksheet>

  <!-- Sector Stats Sheet -->
  <Worksheet ss:Name="섹터별 통계">
    <Table>
      <Column ss:Width="120"/>
      <Column ss:Width="80"/>
      <Column ss:Width="80"/>
      <Column ss:Width="80"/>
      <Column ss:Width="150"/>
      <Column ss:Width="150"/>
      <Row>
        <Cell ss:StyleID="Header"><Data ss:Type="String">섹터</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">거래수</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">매수</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">매도</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">거래금액</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">실현손익</Data></Cell>
      </Row>
      ${Array.from(sectorStats.entries())
        .map(
          ([sector, stats]) => `
      <Row>
        <Cell><Data ss:Type="String">${sector}</Data></Cell>
        <Cell><Data ss:Type="Number">${stats.trades}</Data></Cell>
        <Cell><Data ss:Type="Number">${stats.buys}</Data></Cell>
        <Cell><Data ss:Type="Number">${stats.sells}</Data></Cell>
        <Cell><Data ss:Type="Number">${stats.totalAmount}</Data></Cell>
        <Cell><Data ss:Type="Number">${stats.totalPnl}</Data></Cell>
      </Row>`
        )
        .join('')}
    </Table>
  </Worksheet>

  <!-- Trades Sheet -->
  <Worksheet ss:Name="거래 내역">
    <Table>
      <Column ss:Width="100"/>
      <Column ss:Width="100"/>
      <Column ss:Width="150"/>
      <Column ss:Width="100"/>
      <Column ss:Width="80"/>
      <Column ss:Width="100"/>
      <Column ss:Width="120"/>
      <Column ss:Width="150"/>
      <Column ss:Width="120"/>
      <Row>
        <Cell ss:StyleID="Header"><Data ss:Type="String">날짜</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">심볼</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">종목명</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">섹터</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">구분</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">수량</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">단가</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">거래금액</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">손익</Data></Cell>
      </Row>
      ${(trades ?? [])
        .map(
          (t) => `
      <Row>
        <Cell><Data ss:Type="String">${t.date}</Data></Cell>
        <Cell><Data ss:Type="String">${t.symbol}</Data></Cell>
        <Cell><Data ss:Type="String">${t.name}</Data></Cell>
        <Cell><Data ss:Type="String">${t.sector}</Data></Cell>
        <Cell><Data ss:Type="String">${t.action === 'BUY' ? '매수' : '매도'}</Data></Cell>
        <Cell><Data ss:Type="Number">${t.quantity}</Data></Cell>
        <Cell><Data ss:Type="Number">${t.price}</Data></Cell>
        <Cell><Data ss:Type="Number">${t.amount}</Data></Cell>
        <Cell><Data ss:Type="Number">${t.pnl ?? ''}</Data></Cell>
      </Row>`
        )
        .join('')}
    </Table>
  </Worksheet>
</Workbook>`;

  // Create blob and download
  const blob = new Blob([xml], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `backtest_report_${now.toISOString().split('T')[0]}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
