import { AppError } from "../errors/appError.js";
import { childrenRepository } from "../repositories/children.repository.js";
import type {
  ChildrenFilters,
  PaginationOptions
} from "../repositories/children.repository.js";

export class ChildrenService {
  async list(filters: ChildrenFilters, pagination: PaginationOptions) {
    return childrenRepository.findAllPaginated(filters, pagination);
  }

  async getById(id: string) {
    const child = await childrenRepository.findById(id);

    if (!child) {
      throw new AppError("Criança não encontrada", 404);
    }

    return child;
  }

  async markAsReviewed(id: string, reviewer: string) {
    const updatedChild = await childrenRepository.markAsReviewed(id, reviewer);

    if (!updatedChild) {
      throw new AppError("Criança não encontrada", 404);
    }

    return updatedChild;
  }
}

export const childrenService = new ChildrenService();