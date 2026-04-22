import { childrenRepository } from "../repositories/children.repository.js";

export class SummaryService {
  async getSummary() {
    return childrenRepository.getSummary();
  }
}

export const summaryService = new SummaryService();