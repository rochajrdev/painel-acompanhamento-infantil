import { AppError } from "../errors/appError.js";
import { childrenRepository } from "../repositories/children.repository.js";
import { heatmapService } from "./heatmap.service.js";
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

  async getAlertsHeatmap() {
    return heatmapService.getAlertsHeatmap();
  }

  async addInteraction(childId: string, technicianName: string, content: string, interactionDate: string) {
    const interaction = await childrenRepository.addInteraction(childId, technicianName, content, interactionDate);
    if (!interaction) {
      throw new AppError("Criança não encontrada", 404);
    }
    return interaction;
  }

  async getInteractions(childId: string) {
    const child = await childrenRepository.findById(childId);
    if (!child) {
      throw new AppError("Criança não encontrada", 404);
    }
    return childrenRepository.getInteractions(childId);
  }
}

export const childrenService = new ChildrenService();