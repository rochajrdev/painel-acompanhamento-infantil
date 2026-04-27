import type {
  ChildParamsInput,
  ChildrenQueryInput,
  ChildInteractionBodyInput,
  UpdateChildBodyInput
} from "../schemas/children.schema.js";
import { childrenService } from "../services/children.service.js";
import { summaryService } from "../services/summary.service.js";
import { pdfService } from "../services/pdf.service.js";
import { excelService } from "../services/excel.service.js";

export async function getSummaryController() {
  return summaryService.getSummary();
}

export async function listChildrenController(
  query: Pick<ChildrenQueryInput, "q" | "bairro" | "revisado" | "incompleto">,
  pagination: Pick<ChildrenQueryInput, "page" | "pageSize">
) {
  return childrenService.list(query, pagination);
}

export async function getChildController(params: ChildParamsInput) {
  return childrenService.getById(params.id);
}

export async function reviewChildController(params: ChildParamsInput, reviewer: string) {
  return childrenService.markAsReviewed(params.id, reviewer);
}

export async function getAlertsHeatmapController() {
  return childrenService.getAlertsHeatmap();
}

export async function createInteractionController(
  params: ChildParamsInput,
  body: ChildInteractionBodyInput,
  reviewer: string
) {
  return childrenService.addInteraction(
    params.id,
    reviewer,
    body.content,
    body.interaction_date
  );
}

export async function getInteractionsController(params: ChildParamsInput) {
  return childrenService.getInteractions(params.id);
}

export async function exportPdfController() {
  return pdfService.generateExecutiveReport();
}

export async function exportRiskMapPdfController() {
  return pdfService.generateRiskMapReport();
}

export async function exportExcelController() {
  return excelService.generateVaccineReport();
}

export async function listBairrosController() {
  return childrenService.listBairros();
}

export async function updateChildController(params: ChildParamsInput, body: UpdateChildBodyInput) {
  return childrenService.update(params.id, body);
}