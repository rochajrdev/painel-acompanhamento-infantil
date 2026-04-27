import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import { childrenRepository } from '../repositories/children.repository.js';

const executiveReportTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Relatório Executivo de Acompanhamento Infantil</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #004A8D; padding-bottom: 20px; }
        .header h1 { color: #004A8D; margin: 0; font-size: 24px; }
        .header p { color: #666; margin: 5px 0 0 0; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
        .card { background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .card h3 { margin-top: 0; color: #0f172a; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
        .metric { font-size: 24px; font-weight: bold; color: #004A8D; margin: 10px 0; }
        .chart-container { width: 100%; height: 300px; margin: 0 auto; display: flex; justify-content: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 30px; font-size: 12px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
        th { background-color: #f1f5f9; font-weight: bold; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; }
        .alert-text { color: #dc2626; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Relatório Executivo de Acompanhamento Infantil</h1>
        <p>Prefeitura do Rio de Janeiro • Gerado em {{date}}</p>
    </div>

    <div class="grid">
        <div class="card">
            <h3>Panorama Geral</h3>
            <div class="metric">{{totalChildren}} Crianças Registradas</div>
            <p><strong>Crianças Revisadas:</strong> {{reviewedChildren}}</p>
            <p><strong>Cadastros Incompletos:</strong> <span class="{{#if incompleteChildren}}alert-text{{/if}}">{{incompleteChildren}}</span></p>
        </div>
        <div class="card">
            <h3>Distribuição de Alertas</h3>
            <p><strong>Total de Alertas:</strong> {{totalAlerts}}</p>
            <ul>
                <li><strong>Saúde:</strong> {{healthAlerts}}</li>
                <li><strong>Educação:</strong> {{educationAlerts}}</li>
                <li><strong>Assistência Social:</strong> {{socialAlerts}}</li>
            </ul>
        </div>
    </div>

    <div class="card" style="margin-bottom: 40px;">
        <h3 style="text-align: center;">Incidência de Alertas por Área</h3>
        <div class="chart-container">
            <canvas id="alertsChart"></canvas>
        </div>
    </div>

    <h3>Top 15 Crianças que Necessitam de Revisão Urgente (Com Alertas)</h3>
    <table>
        <thead>
            <tr>
                <th>Nome</th>
                <th>Bairro</th>
                <th>Revisado</th>
                <th>Alertas (S/E/A)</th>
            </tr>
        </thead>
        <tbody>
            {{#each urgentChildren}}
            <tr>
                <td>{{this.nome}}</td>
                <td>{{this.bairro}}</td>
                <td>{{this.revisado_em}}</td>
                <td>
                    <span class="alert-text">{{this.saudeAlerts}}</span> / 
                    <span class="alert-text">{{this.educationAlerts}}</span> / 
                    <span class="alert-text">{{this.socialAlerts}}</span>
                </td>
            </tr>
            {{/each}}
            {{#unless urgentChildren.length}}
            <tr>
                <td colspan="4" style="text-align: center;">Nenhuma criança pendente com alertas críticos encontrada.</td>
            </tr>
            {{/unless}}
        </tbody>
    </table>

    <div class="footer">
        Relatório gerado automaticamente pelo Sistema de Acompanhamento Infantil.
    </div>

    <script>
        const ctx = document.getElementById('alertsChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Saúde', 'Educação', 'Assistência Social'],
                datasets: [{
                    data: [{{healthAlerts}}, {{educationAlerts}}, {{socialAlerts}}],
                    backgroundColor: ['#ef4444', '#3b82f6', '#f59e0b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' }
                },
                animation: false
            }
        });
    </script>
</body>
</html>
`;

const riskMapTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Mapa de Risco por Bairro</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        body { 
            font-family: 'Inter', sans-serif; 
            padding: 40px; 
            color: #333; 
            background-color: white;
            margin: 0;
        }
        
        .header { 
            display: flex;
            align-items: center;
            margin-bottom: 20px; 
        }
        
        .logo-circle {
            width: 60px;
            height: 60px;
            background-color: #C05600;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 14px;
            margin-right: 20px;
        }
        
        .header-content h1 { 
            color: #C05600; 
            margin: 0; 
            font-size: 24px; 
            font-weight: 700;
        }
        
        .header-content p { 
            color: #666; 
            margin: 5px 0 0 0; 
            font-size: 13px;
        }

        .divider {
            height: 3px;
            background-color: #C05600;
            margin-bottom: 30px;
        }
        
        .metrics-container { 
            display: flex; 
            justify-content: space-between; 
            gap: 20px; 
            margin-bottom: 40px; 
        }
        
        .metric-card { 
            flex: 1;
            padding: 20px 10px; 
            border-radius: 8px; 
            text-align: center;
            border: 1px solid #fde68a;
            background-color: #fffbeb;
        }

        .metric-card.critical {
            border: 1px solid #fecdd3;
            background-color: #fff1f2;
        }
        
        .metric-card h3 { 
            margin: 0; 
            color: #92400e; 
            font-size: 11px; 
            text-transform: uppercase;
            font-weight: 700;
        }

        .metric-card.critical h3 {
            color: #be123c;
        }
        
        .metric-value { 
            font-size: 32px; 
            font-weight: 700; 
            color: #b45309; 
            margin-top: 15px; 
        }

        .metric-card.critical .metric-value {
            color: #e11d48;
        }
        
        .chart-box {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 40px;
            background-color: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .chart-box h3 {
            text-align: center;
            color: #1e293b;
            font-size: 16px;
            margin-top: 0;
            margin-bottom: 20px;
        }

        .chart-container { 
            width: 100%; 
            height: 300px; 
        }
        
        .table-section h3 {
            color: #334155;
            font-size: 18px;
            margin-bottom: 15px;
        }

        table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 12px; 
        }
        
        th, td { 
            padding: 12px 8px; 
            text-align: left; 
            border-bottom: 1px solid #e2e8f0;
        }
        
        th { 
            background-color: #f8fafc; 
            color: #475569;
            font-weight: 700; 
            border-top: 1px solid #e2e8f0;
        }
        
        td {
            color: #334155;
            font-weight: 600;
        }
        
        .text-red { color: #dc2626; }
        .text-right { text-align: right; }
        
        .footer { 
            margin-top: 50px; 
            text-align: center; 
            font-size: 10px; 
            color: #94a3b8; 
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo-circle">RIO</div>
        <div class="header-content">
            <h1>Painel de Acompanhamento Infantil</h1>
            <p>Mapa de Risco por Bairro - Gerado em {{date}}</p>
        </div>
    </div>
    <div class="divider"></div>

    <div class="metrics-container">
        <div class="metric-card">
            <h3>Total de Crianças<br>Analisadas</h3>
            <div class="metric-value">{{totalChildren}}</div>
        </div>
        <div class="metric-card critical">
            <h3>Total de Alertas<br>Críticos</h3>
            <div class="metric-value">{{totalAlerts}}</div>
        </div>
        <div class="metric-card">
            <h3>Casos Protegidos<br>(Revisados)</h3>
            <div class="metric-value">{{reviewedChildren}}</div>
        </div>
    </div>

    <div class="chart-box">
        <h3>Densidade de Alertas por Bairro</h3>
        <div class="chart-container">
            <canvas id="alertsChart"></canvas>
        </div>
    </div>

    <div class="table-section">
        <h3>Detalhamento dos Bairros Mais Críticos</h3>
        <table>
            <thead>
                <tr>
                    <th>Posição</th>
                    <th>Bairro</th>
                    <th class="text-right">Total de Alertas Ativos</th>
                </tr>
            </thead>
            <tbody>
                {{#each urgentBairros}}
                <tr>
                    <td>#{{this.position}}</td>
                    <td>{{this.bairro}}</td>
                    <td class="text-right text-red">{{this.alerts}}</td>
                </tr>
                {{/each}}
                {{#unless urgentBairros.length}}
                <tr>
                    <td colspan="3" style="text-align: center; padding: 20px;">Nenhum alerta encontrado.</td>
                </tr>
                {{/unless}}
            </tbody>
        </table>
    </div>

    <div class="footer">
        Documento gerado pelo Painel de Acompanhamento Infantil - Página 1 de 1
    </div>

    <script>
        const ctx = document.getElementById('alertsChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: {{{chartLabels}}},
                datasets: [{
                    label: 'Total de Alertas',
                    data: {{{chartData}}},
                    backgroundColor: '#F59E0B',
                    barThickness: 30
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9' }
                    },
                    y: {
                        grid: { display: false }
                    }
                },
                animation: false
            }
        });
    </script>
</body>
</html>
`;

export class PdfService {
  async generateExecutiveReport(): Promise<Buffer> {
    const summary = await childrenRepository.getSummary();
    
    // Buscar crianças com alertas que não estão revisadas
    const allChildren = await childrenRepository.findAllPaginated(
      { revisado: false },
      { page: 1, pageSize: 100 }
    );

    // Filtrar apenas crianças com alertas e ordenar
    const urgentChildren = allChildren.items
      .map(child => {
        const saudeAlerts = child.saude?.alertas?.length || 0;
        const educationAlerts = child.educacao?.alertas?.length || 0;
        const socialAlerts = child.assistencia_social?.alertas?.length || 0;
        const totalAlerts = saudeAlerts + educationAlerts + socialAlerts;
        return {
          nome: child.nome,
          bairro: child.bairro,
          revisado_em: child.revisado_em ? "Sim" : "Não",
          saudeAlerts,
          educationAlerts,
          socialAlerts,
          totalAlerts
        };
      })
      .filter(child => child.totalAlerts > 0)
      .sort((a, b) => b.totalAlerts - a.totalAlerts)
      .slice(0, 15);

    const template = handlebars.compile(executiveReportTemplate);
    const htmlContent = template({
      date: new Date().toLocaleDateString('pt-BR'),
      totalChildren: summary.total_criancas,
      reviewedChildren: summary.total_revisadas,
      incompleteChildren: summary.criancas_incompletas,
      totalAlerts: summary.total_alertas,
      healthAlerts: summary.alertas_saude,
      educationAlerts: summary.alertas_educacao,
      socialAlerts: summary.alertas_assistencia,
      urgentChildren
    });

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px' }
    });

    await browser.close();
    
    return Buffer.from(pdfBuffer);
  }

  async generateRiskMapReport(): Promise<Buffer> {
    const summary = await childrenRepository.getSummary();
    
    // Buscar todas as crianças para agrupar por bairro
    const allChildren = await childrenRepository.findAllPaginated(
      {},
      { page: 1, pageSize: 10000 }
    );

    // Agrupar e contar alertas por bairro
    const bairroStats: Record<string, number> = {};

    allChildren.items.forEach(child => {
      const saudeAlerts = child.saude?.alertas?.length || 0;
      const educationAlerts = child.educacao?.alertas?.length || 0;
      const socialAlerts = child.assistencia_social?.alertas?.length || 0;
      const totalAlerts = saudeAlerts + educationAlerts + socialAlerts;

      if (totalAlerts > 0) {
        if (!bairroStats[child.bairro]) {
          bairroStats[child.bairro] = 0;
        }
        bairroStats[child.bairro] += totalAlerts;
      }
    });

    // Ordenar bairros por total de alertas
    const sortedBairros = Object.entries(bairroStats)
      .map(([bairro, alerts]) => ({ bairro, alerts }))
      .sort((a, b) => b.alerts - a.alerts)
      .slice(0, 5); // Pega os 5 piores bairros (igual na imagem)

    // Dados para a tabela
    const urgentBairros = sortedBairros.map((item, index) => ({
      position: index,
      bairro: item.bairro,
      alerts: item.alerts
    }));

    // Dados para o gráfico
    const chartLabels = JSON.stringify(sortedBairros.map(item => item.bairro));
    const chartData = JSON.stringify(sortedBairros.map(item => item.alerts));

    const template = handlebars.compile(riskMapTemplate);
    const htmlContent = template({
      date: new Date().toLocaleString('pt-BR'),
      totalChildren: summary.total_criancas,
      totalAlerts: summary.total_alertas,
      reviewedChildren: summary.total_revisadas,
      urgentBairros,
      chartLabels,
      chartData
    });

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' }
    });

    await browser.close();
    
    return Buffer.from(pdfBuffer);
  }
}

export const pdfService = new PdfService();
