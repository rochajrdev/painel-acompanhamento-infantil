import type {
  ChildParamsInput,
  ChildrenQueryInput,
  ChildInteractionBodyInput
} from "../schemas/children.schema.js";
import { childrenService } from "../services/children.service.js";
import { summaryService } from "../services/summary.service.js";

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