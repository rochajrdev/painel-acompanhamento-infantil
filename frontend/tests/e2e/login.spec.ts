import { test, expect } from '@playwright/test';

test.describe('Autenticação', () => {
  test('deve realizar login com sucesso e redirecionar para o dashboard', async ({ page }) => {
    // Ir para a página de login
    await page.goto('http://localhost:3000/login');

    // Preencher campos
    await page.fill('input[type="email"]', 'tecnico@prefeitura.rio');
    await page.fill('input[type="password"]', 'painel@2024');

    // Clicar no botão de entrar
    await page.click('button[type="submit"]');

    // Verificar se redirecionou para o dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
    
    // Verificar se o título do dashboard aparece
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('deve mostrar erro ao tentar login com credenciais inválidas', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'errado@rio.rj.gov.br');
    await page.fill('input[type="password"]', 'senha-errada');
    await page.click('button[type="submit"]');

    // Verificar se mensagem de erro aparece (ajuste o seletor conforme sua UI)
    await expect(page.locator('text=Credenciais inválidas')).toBeVisible();
  });
});
