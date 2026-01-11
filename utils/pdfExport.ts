import type { BacktestResults, Config } from '../types';

interface ExportOptions {
  results: BacktestResults;
  expression: string;
  config: Config;
}

/**
 * Generate a professional PDF report for backtest results
 * Uses browser's print functionality for PDF generation
 */
export function exportToPdf({ results, expression, config }: ExportOptions): void {
  const { kpis, pnlData, benchmark, trades } = results;

  // Calculate additional statistics
  const startValue = pnlData[0]?.value ?? 1000;
  const endValue = pnlData[pnlData.length - 1]?.value ?? 1000;
  const totalReturn = ((endValue - startValue) / startValue) * 100;
  const benchmarkReturn = benchmark?.return ?? 0;
  const alpha = totalReturn - benchmarkReturn;

  // Format date
  const now = new Date();
  const dateStr = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('ko-KR');

  // Generate PnL chart data as SVG
  const chartWidth = 700;
  const chartHeight = 200;
  const chartPadding = 40;
  const maxValue = Math.max(...pnlData.map((d) => d.value));
  const minValue = Math.min(...pnlData.map((d) => d.value));
  const valueRange = maxValue - minValue || 1;

  const portfolioPath = pnlData
    .map((point, i) => {
      const x = chartPadding + (i / (pnlData.length - 1)) * (chartWidth - 2 * chartPadding);
      const y =
        chartHeight -
        chartPadding -
        ((point.value - minValue) / valueRange) * (chartHeight - 2 * chartPadding);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  let benchmarkPath = '';
  if (benchmark?.data) {
    benchmarkPath = benchmark.data
      .map((point, i) => {
        const x =
          chartPadding + (i / (benchmark.data.length - 1)) * (chartWidth - 2 * chartPadding);
        const y =
          chartHeight -
          chartPadding -
          ((point.value - minValue) / valueRange) * (chartHeight - 2 * chartPadding);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }

  const chartSvg = `
    <svg width="${chartWidth}" height="${chartHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8fafc"/>
      <!-- Grid lines -->
      <g stroke="#e2e8f0" stroke-width="1">
        ${[0, 0.25, 0.5, 0.75, 1]
          .map((p) => {
            const y = chartPadding + p * (chartHeight - 2 * chartPadding);
            return `<line x1="${chartPadding}" y1="${y}" x2="${chartWidth - chartPadding}" y2="${y}"/>`;
          })
          .join('')}
      </g>
      <!-- Benchmark line -->
      ${benchmarkPath ? `<path d="${benchmarkPath}" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5,5"/>` : ''}
      <!-- Portfolio line -->
      <path d="${portfolioPath}" fill="none" stroke="#0891b2" stroke-width="2.5"/>
      <!-- Legend -->
      <g transform="translate(${chartPadding}, ${chartHeight - 15})">
        <line x1="0" y1="0" x2="20" y2="0" stroke="#0891b2" stroke-width="2.5"/>
        <text x="25" y="4" font-size="11" fill="#374151">포트폴리오</text>
        ${
          benchmark
            ? `
          <line x1="100" y1="0" x2="120" y2="0" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5,5"/>
          <text x="125" y="4" font-size="11" fill="#374151">${benchmark.name}</text>
        `
            : ''
        }
      </g>
      <!-- Y-axis labels -->
      <text x="${chartPadding - 5}" y="${chartPadding + 5}" font-size="10" fill="#6b7280" text-anchor="end">${maxValue.toFixed(0)}</text>
      <text x="${chartPadding - 5}" y="${chartHeight - chartPadding + 5}" font-size="10" fill="#6b7280" text-anchor="end">${minValue.toFixed(0)}</text>
    </svg>
  `;

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>백테스트 리포트 - ${dateStr}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1f2937;
      background: white;
      padding: 40px;
      line-height: 1.6;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #0891b2;
    }

    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #0891b2;
      margin-bottom: 8px;
    }

    .header .subtitle {
      font-size: 14px;
      color: #6b7280;
    }

    .section {
      margin-bottom: 30px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }

    .expression-box {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px 20px;
      font-family: 'Fira Code', 'Consolas', monospace;
      font-size: 14px;
      color: #0891b2;
      overflow-x: auto;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
    }

    .kpi-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }

    .kpi-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 5px;
    }

    .kpi-value {
      font-size: 20px;
      font-weight: 700;
    }

    .kpi-value.positive { color: #10b981; }
    .kpi-value.negative { color: #ef4444; }
    .kpi-value.neutral { color: #374151; }
    .kpi-value.highlight { color: #0891b2; }

    .config-table {
      width: 100%;
      border-collapse: collapse;
    }

    .config-table td {
      padding: 8px 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    .config-table td:first-child {
      font-weight: 500;
      color: #374151;
      width: 40%;
    }

    .config-table td:last-child {
      color: #6b7280;
    }

    .trade-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }

    .trade-table th,
    .trade-table td {
      padding: 8px 10px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    .trade-table th {
      background: #f8fafc;
      font-weight: 600;
      color: #374151;
    }

    .trade-table tr:hover {
      background: #f9fafb;
    }

    .trade-table .buy {
      color: #dc2626;
      font-weight: 600;
    }

    .trade-table .sell {
      color: #2563eb;
      font-weight: 600;
    }

    .trade-table .pnl-positive {
      color: #10b981;
      font-weight: 600;
    }

    .trade-table .pnl-negative {
      color: #ef4444;
      font-weight: 600;
    }

    .trade-table .amount {
      text-align: right;
    }

    .trade-summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }

    .trade-summary-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }

    .trade-summary-item .label {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .trade-summary-item .value {
      font-size: 16px;
      font-weight: 700;
      color: #374151;
    }

    .chart-container {
      text-align: center;
      margin: 20px 0;
    }

    .summary-box {
      background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
      color: white;
      border-radius: 12px;
      padding: 25px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      text-align: center;
    }

    .summary-item .label {
      font-size: 12px;
      opacity: 0.9;
      margin-bottom: 5px;
    }

    .summary-item .value {
      font-size: 28px;
      font-weight: 700;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
    }

    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 백테스트 리포트</h1>
    <div class="subtitle">Alpha Architect Studio | ${dateStr} ${timeStr}</div>
  </div>

  <div class="section">
    <div class="summary-box">
      <div class="summary-item">
        <div class="label">총 수익률</div>
        <div class="value">${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)}%</div>
      </div>
      <div class="summary-item">
        <div class="label">${benchmark?.name ?? '벤치마크'} 수익률</div>
        <div class="value">${benchmarkReturn >= 0 ? '+' : ''}${benchmarkReturn.toFixed(2)}%</div>
      </div>
      <div class="summary-item">
        <div class="label">알파 (초과수익)</div>
        <div class="value">${alpha >= 0 ? '+' : ''}${alpha.toFixed(2)}%</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">알파 수식</h2>
    <div class="expression-box">${expression}</div>
  </div>

  <div class="section">
    <h2 class="section-title">핵심 성과 지표 (KPI)</h2>
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">정보비율 (IR)</div>
        <div class="kpi-value highlight">${kpis.ir.toFixed(2)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">연간 수익률</div>
        <div class="kpi-value ${kpis.annualReturn >= 0 ? 'positive' : 'negative'}">${kpis.annualReturn >= 0 ? '+' : ''}${(kpis.annualReturn * 100).toFixed(2)}%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">최대 낙폭</div>
        <div class="kpi-value negative">${(kpis.maxDrawdown * 100).toFixed(2)}%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">턴오버 (일간)</div>
        <div class="kpi-value neutral">${(kpis.turnover * 100).toFixed(2)}%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">마진 (bps)</div>
        <div class="kpi-value neutral">${(kpis.margin * 10000).toFixed(2)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">상관관계</div>
        <div class="kpi-value neutral">${kpis.correlation.toFixed(2)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">시뮬레이션 기간</div>
        <div class="kpi-value neutral">${pnlData.length}일</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">최종 자산</div>
        <div class="kpi-value highlight">${endValue.toFixed(0)}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">포트폴리오 손익 (PnL) 차트</h2>
    <div class="chart-container">
      ${chartSvg}
    </div>
  </div>

  ${
    trades && trades.length > 0
      ? `
  <div class="section">
    <h2 class="section-title">거래 내역</h2>
    <div class="trade-summary">
      <div class="trade-summary-item">
        <div class="label">총 거래 수</div>
        <div class="value">${trades.length}건</div>
      </div>
      <div class="trade-summary-item">
        <div class="label">매수 거래</div>
        <div class="value">${trades.filter((t) => t.action === 'BUY').length}건</div>
      </div>
      <div class="trade-summary-item">
        <div class="label">매도 거래</div>
        <div class="value">${trades.filter((t) => t.action === 'SELL').length}건</div>
      </div>
      <div class="trade-summary-item">
        <div class="label">실현 손익</div>
        <div class="value ${trades.reduce((sum, t) => sum + (t.pnl || 0), 0) >= 0 ? 'pnl-positive' : 'pnl-negative'}">${trades.reduce((sum, t) => sum + (t.pnl || 0), 0).toLocaleString()}원</div>
      </div>
    </div>
    <table class="trade-table">
      <thead>
        <tr>
          <th>날짜</th>
          <th>종목</th>
          <th>구분</th>
          <th class="amount">수량</th>
          <th class="amount">단가</th>
          <th class="amount">거래금액</th>
          <th class="amount">손익</th>
        </tr>
      </thead>
      <tbody>
        ${trades
          .map(
            (trade) => `
          <tr>
            <td>${trade.date}</td>
            <td>${trade.name} <span style="color:#9ca3af;font-size:10px;">(${trade.symbol})</span></td>
            <td class="${trade.action === 'BUY' ? 'buy' : 'sell'}">${trade.action === 'BUY' ? '매수' : '매도'}</td>
            <td class="amount">${trade.quantity.toLocaleString()}</td>
            <td class="amount">${trade.price.toLocaleString()}</td>
            <td class="amount">${trade.amount.toLocaleString()}</td>
            <td class="amount ${trade.pnl ? (trade.pnl >= 0 ? 'pnl-positive' : 'pnl-negative') : ''}">${trade.pnl ? (trade.pnl >= 0 ? '+' : '') + trade.pnl.toLocaleString() : '-'}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  </div>
  `
      : ''
  }

  <div class="section">
    <h2 class="section-title">시뮬레이션 설정</h2>
    <table class="config-table">
      <tr><td>유니버스</td><td>${config.universe}</td></tr>
      <tr><td>지역</td><td>${config.region}</td></tr>
      <tr><td>딜레이</td><td>${config.delay}일</td></tr>
      <tr><td>룩백 기간</td><td>${config.lookbackDays}일</td></tr>
      <tr><td>최대 종목 비중</td><td>${(config.maxStockWeight * 100).toFixed(1)}%</td></tr>
      <tr><td>디케이</td><td>${config.decay}</td></tr>
      <tr><td>중립화</td><td>${config.neutralization}</td></tr>
      <tr><td>성과 목표</td><td>${config.performanceGoal || '-'}</td></tr>
    </table>
  </div>

  <div class="footer">
    <p>이 리포트는 Alpha Architect Studio에서 자동 생성되었습니다.</p>
    <p>과거 성과는 미래 수익을 보장하지 않습니다. 투자 결정 전 충분한 검토가 필요합니다.</p>
  </div>

  <div class="no-print" style="margin-top: 30px; text-align: center;">
    <button onclick="window.print()" style="
      background: #0891b2;
      color: white;
      border: none;
      padding: 12px 30px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
    ">
      PDF로 저장하기
    </button>
    <button onclick="window.close()" style="
      background: #6b7280;
      color: white;
      border: none;
      padding: 12px 30px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      margin-left: 10px;
    ">
      닫기
    </button>
  </div>
</body>
</html>
  `;

  // Open new window with the report
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    alert('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
  }
}
