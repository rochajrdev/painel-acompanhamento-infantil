import exceljs from 'exceljs';
import { childrenRepository } from '../repositories/children.repository.js';
import type { HeatmapChildRow } from '../repositories/children.repository.js';

export class ExcelService {
  async generateVaccineReport(): Promise<Buffer> {
    const allChildren = await childrenRepository.findForHeatmap();

    const workbook = new exceljs.Workbook();
    workbook.creator = 'Prefeitura do Rio de Janeiro';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Acompanhamento de Vacinas');

    // Definir colunas
    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nome da Criança', key: 'nome', width: 30 },
      { header: 'Data de Nascimento', key: 'data_nascimento', width: 15 },
      { header: 'Bairro', key: 'bairro', width: 20 },
      { header: 'Possui Alerta de Vacina', key: 'alerta_vacina', width: 25 },
      { header: 'Detalhes dos Alertas (Saúde)', key: 'alertas_detalhes', width: 50 },
    ];

    // Estilizar o cabeçalho
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF004A8D' } // Azul padrão da prefeitura
    };

    // Preencher linhas
    allChildren.forEach(child => {
      const saudeAlerts = child.saude?.alertas || [];
      const hasVaccineAlert = saudeAlerts.some((alerta: string) => 
        alerta.toLowerCase().includes('vacina') || 
        alerta.toLowerCase().includes('atrasada') ||
        alerta.toLowerCase().includes('calendário vacinal')
      );

      const row = sheet.addRow({
        id: child.id,
        nome: child.nome,
        data_nascimento: child.data_nascimento,
        bairro: child.bairro,
        alerta_vacina: hasVaccineAlert ? 'SIM' : 'NÃO',
        alertas_detalhes: saudeAlerts.join('; ')
      });

      // Se tiver alerta de vacina, pintar a célula de alerta de vermelho
      if (hasVaccineAlert) {
        row.getCell('alerta_vacina').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFCCCC' } // Vermelho claro
        };
        row.getCell('alerta_vacina').font = {
          color: { argb: 'FF990000' }, // Vermelho escuro
          bold: true
        };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

export const excelService = new ExcelService();
