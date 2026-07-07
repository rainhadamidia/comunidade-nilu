/* ============================================================
   ILUMINNARE — Geração nativa de PDF (jsPDF) do relatório PCI
   Desenha o relatório como texto real (não é captura de tela do
   DOM) — evita cortes/desalinhamento e gera texto selecionável.
   Portado de mvp/pdf.js (vanilla JS + CDN) para o app Lovable (TS + npm jsPDF).
============================================================ */

import { jsPDF } from 'jspdf';
import { PERFIS, type TraitId } from './content';
import type { RelatorioPCI } from './engine';

const TRAIT_RGB: Record<TraitId, [number, number, number]> = {
  inovador: [59, 130, 246],
  comunicador: [245, 158, 11],
  articulador: [239, 68, 68],
  metodico: [16, 185, 129],
  executor: [139, 92, 246],
};

const COR = {
  bg: [8, 8, 15] as [number, number, number],
  border: [42, 42, 61] as [number, number, number],
  textPrimary: [241, 245, 249] as [number, number, number],
  textSecondary: [148, 163, 184] as [number, number, number],
  textMuted: [100, 116, 139] as [number, number, number],
  purpleLight: [167, 139, 250] as [number, number, number],
  amber: [252, 211, 77] as [number, number, number],
  greenLight: [134, 239, 172] as [number, number, number],
  redLight: [252, 165, 165] as [number, number, number],
};

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_X = 16;
const MARGIN_TOP = 18;
const MARGIN_BOTTOM = 18;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

interface ParagrafoOpts {
  x?: number;
  largura?: number;
  tamanho?: number;
  cor?: [number, number, number];
  negrito?: boolean;
  entrelinha?: number;
  espacoDepois?: number;
}

interface TituloOpts {
  tamanho?: number;
  cor?: [number, number, number];
  espacoAntes?: number;
  espacoDepois?: number;
}

/** Gera o PDF nativo do relatório PCI (sem captura de tela) e devolve a instância jsPDF. */
export function gerarPdfRelatorio(relatorio: RelatorioPCI, primeiroNome: string): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = MARGIN_TOP;

  function pintarFundo() {
    doc.setFillColor(...COR.bg);
    doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
  }
  pintarFundo();

  function novaPagina() {
    doc.addPage();
    pintarFundo();
    y = MARGIN_TOP;
  }

  function checarEspaco(alturaNecessaria: number) {
    if (y + alturaNecessaria > PAGE_H - MARGIN_BOTTOM) novaPagina();
  }

  function paragrafo(texto: string, opts: ParagrafoOpts = {}) {
    const {
      x = MARGIN_X,
      largura = CONTENT_W,
      tamanho = 10,
      cor = COR.textSecondary,
      negrito = false,
      entrelinha = 5,
      espacoDepois = 3,
    } = opts;
    doc.setFont('helvetica', negrito ? 'bold' : 'normal');
    doc.setFontSize(tamanho);
    doc.setTextColor(...cor);
    const linhas = doc.splitTextToSize(texto, largura) as string[];
    linhas.forEach((linha) => {
      checarEspaco(entrelinha);
      doc.text(linha, x, y);
      y += entrelinha;
    });
    y += espacoDepois;
  }

  function titulo(texto: string, opts: TituloOpts = {}) {
    const { tamanho = 13, cor = COR.textPrimary, espacoAntes = 5, espacoDepois = 6 } = opts;
    checarEspaco(tamanho / 2 + espacoAntes + espacoDepois);
    y += espacoAntes;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(tamanho);
    doc.setTextColor(...cor);
    doc.text(texto, MARGIN_X, y);
    y += espacoDepois;
  }

  // ---------- Cabeçalho ----------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COR.purpleLight);
  doc.text('ILUMINNARE', MARGIN_X, y);
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COR.amber);
  doc.text('RELATÓRIO DE MAPEAMENTO COMPORTAMENTAL AVANÇADO', MARGIN_X, y);
  y += 9;
  titulo(`O Mapa Comportamental de ${primeiroNome}`, { tamanho: 17, espacoAntes: 0, espacoDepois: 7 });

  // ---------- Barras de score ----------
  const idsOrdenados = (Object.keys(relatorio.scores) as TraitId[]).sort(
    (a, b) => relatorio.scores[b] - relatorio.scores[a]
  );
  checarEspaco(idsOrdenados.length * 7.5 + 8);
  idsOrdenados.forEach((id) => {
    const nome = PERFIS[id].nome;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COR.textSecondary);
    doc.text(nome, MARGIN_X, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TRAIT_RGB[id]);
    doc.text(`${relatorio.scores[id]}%`, PAGE_W - MARGIN_X, y, { align: 'right' });
    y += 7;
  });
  y += 6;

  // ---------- Seção 1: Perfis dominantes ----------
  titulo('1. Seus 2 Perfis Dominantes');
  ([relatorio.dominante, relatorio.secundario] as TraitId[]).forEach((id) => {
    const p = PERFIS[id];
    checarEspaco(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...TRAIT_RGB[id]);
    doc.text(`${p.nome} — ${relatorio.scores[id]}%`, MARGIN_X, y);
    y += 6;
    paragrafo(`Dor de origem: ${p.dorOrigem}`, { tamanho: 8.5, cor: COR.textMuted, entrelinha: 4.2, espacoDepois: 2.5 });
    paragrafo(`Sua força nativa: ${p.forcaNativa}`);
    paragrafo(`Em alta performance (Luz): ${p.luz}`);
    paragrafo(`Sob estresse (Sombra): ${p.sombra}`);
    paragrafo(`"${p.abordagemHumanizada}"`, { cor: COR.textPrimary, tamanho: 9.5, espacoDepois: 7 });
  });

  // ---------- Seção 2: Dinâmica ----------
  titulo('2. Dinâmica Entre os Seus Traços');
  relatorio.dinamica.forEach((d) => {
    checarEspaco(11);
    const label = d.tipo === 'sinergia' ? 'SINERGIA' : d.tipo === 'conflito' ? 'CONFLITO INTERNO' : 'COMBINAÇÃO';
    const corLabel = d.tipo === 'sinergia' ? COR.greenLight : d.tipo === 'conflito' ? COR.redLight : COR.textMuted;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...corLabel);
    doc.text(label, MARGIN_X, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(...COR.textPrimary);
    doc.text(d.nome, MARGIN_X, y);
    y += 6.5;
    if (d.texto) paragrafo(d.texto);
    if (d.sistema) paragrafo(`O que acontece: ${d.sistema}`);
    if (d.sentimento) paragrafo(`O que você sente: ${d.sentimento}`, { espacoDepois: 7 });
    else y += 4;
  });

  // ---------- Seção 3: Impacto ----------
  titulo('3. Impacto Prático na Sua Vida');
  paragrafo(relatorio.impacto.titulo, { negrito: true, cor: COR.textPrimary, tamanho: 11, espacoDepois: 4 });
  paragrafo(`Na carreira: ${relatorio.impacto.carreira}`);
  paragrafo(`Nas relações: ${relatorio.impacto.relacoes}`);
  paragrafo(`Na saúde mental: ${relatorio.impacto.saudeMental}`, { espacoDepois: 7 });

  // ---------- Seção 4: PSI ----------
  if (relatorio.psi) {
    titulo('4. Método PSI — Sua Estratégia');
    paragrafo(`Seu gargalo provável: ${relatorio.psi.gargalo}`, {
      negrito: true,
      cor: COR.textPrimary,
      tamanho: 10.5,
      espacoDepois: 4,
    });
    paragrafo(relatorio.psi.estrategia, { espacoDepois: 8 });
  }

  // ---------- Disclaimer ----------
  checarEspaco(16);
  doc.setDrawColor(...COR.border);
  doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
  y += 5;
  paragrafo(
    'Este relatório é uma ferramenta de autoconhecimento baseada em autoavaliação comportamental e não substitui diagnóstico psicológico ou psiquiátrico profissional. Seus dados são tratados conforme a LGPD (Lei 13.709/2018) e utilizados exclusivamente para a geração deste relatório.',
    { tamanho: 7.5, cor: COR.textMuted, entrelinha: 3.6 }
  );

  return doc;
}
