import { childrenRepository } from "../repositories/children.repository.js";
import type {
  ChildParamsInput,
  ChildrenQueryInput
} from "../schemas/children.schema.js";

export async function getSummaryController() {
  return childrenRepository.getSummary();
}

export async function listChildrenController(
  query: Pick<ChildrenQueryInput, "q" | "bairro" | "revisado" | "incompleto">,
  pagination: Pick<ChildrenQueryInput, "page" | "pageSize">
) {
  return childrenRepository.findAllPaginated(query, pagination);
}

export async function getChildController(params: ChildParamsInput) {
  return childrenRepository.findById(params.id);
}

export async function reviewChildController(params: ChildParamsInput, reviewer: string) {
  return childrenRepository.markAsReviewed(params.id, reviewer);
}