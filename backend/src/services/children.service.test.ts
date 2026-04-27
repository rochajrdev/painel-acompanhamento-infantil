import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChildrenService } from "./children.service.js";
import { childrenRepository } from "../repositories/children.repository.js";
import { AppError } from "../errors/appError.js";

vi.mock("../repositories/children.repository.js", () => ({
  childrenRepository: {
    findAllPaginated: vi.fn(),
    findById: vi.fn(),
    markAsReviewed: vi.fn()
  }
}));

describe("ChildrenService", () => {
  let service: ChildrenService;

  beforeEach(() => {
    service = new ChildrenService();
    vi.clearAllMocks();
  });

  describe("getById", () => {
    it("should return child if found", async () => {
      const mockChild = { id: "123", nome: "Teste" };
      vi.mocked(childrenRepository.findById).mockResolvedValue(mockChild as any);

      const result = await service.getById("123");

      expect(result).toEqual(mockChild);
      expect(childrenRepository.findById).toHaveBeenCalledWith("123");
    });

    it("should throw AppError 404 if child not found", async () => {
      vi.mocked(childrenRepository.findById).mockResolvedValue(null);

      await expect(service.getById("123")).rejects.toThrow(AppError);
      await expect(service.getById("123")).rejects.toThrow("Criança não encontrada");
    });
  });

  describe("markAsReviewed", () => {
    it("should return updated child", async () => {
      const mockChild = { id: "123", revisado_em: new Date().toISOString() };
      vi.mocked(childrenRepository.markAsReviewed).mockResolvedValue(mockChild as any);

      const result = await service.markAsReviewed("123", "revisor");

      expect(result).toEqual(mockChild);
      expect(childrenRepository.markAsReviewed).toHaveBeenCalledWith("123", "revisor");
    });

    it("should throw AppError 404 if child not found when reviewing", async () => {
      vi.mocked(childrenRepository.markAsReviewed).mockResolvedValue(null);

      await expect(service.markAsReviewed("123", "revisor")).rejects.toThrow(AppError);
    });
  });
});
