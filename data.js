// ============================================================
// ALFA SUPLEMENTOS V9 — CAMADA HÍBRIDA LOCAL + NUVEM
// ============================================================
// Esta camada foi separada para facilitar uma futura migração para
// Supabase, Firebase, MySQL/API ou outro banco sem reescrever a UI.

window.ALFA_DEFAULT_DATA = {
  settings: {
    storeName: "Alfa Suplementos",
    whatsappNumber: "5500000000000",
    instagram: "#",
    facebook: "#",
    deliveryBase: 8,
    freeDeliveryFrom: 250,
    locale: "pt-BR",
    currency: "BRL",
    heroTitleTop: "SUPERE SEUS",
    heroTitleOutline: "LIMITES.",
    heroTitleAccent: "EVOLUA.",
    heroSubtitle: "Suplementos selecionados para quem leva treino, desempenho e evolução a sério.",
    announcement: "OFERTAS ESPECIAIS • COMBOS • LANÇAMENTOS • FINALIZE PELO WHATSAPP",
    orderPrefix: "ALFA",
    lowStockAlert: 7,
    reserveStockOnCheckout: false,
    businessHours: "Segunda a sábado",
    address: "",
    pixKey: "",
    adminPin: "1234",
    pixDiscountPercent: 5,
    quantityDiscount2: 3,
    quantityDiscount3: 5,
    cartRecoveryHours: 48,
    customerCenterEnabled: true,
    liveOfferEnabled: true,
    liveOfferDurationMinutes: 90,
    campaignAutoRotateSeconds: 7,
    customerTrackingHint: "Use o código do pedido e os 4 últimos números do WhatsApp.",
    mobileDockEnabled: true,
    loyaltyEnabled: true,
    loyaltyPointsPerReal: 1,
    loyaltyProThreshold: 500,
    loyaltyEliteThreshold: 1500,
    monthlyRevenueGoal: 12000,
    defaultMarginTarget: 35,
    referralRewardPoints: 100
  },
  banners: [
    { id: "hero-main", title: "SEM DESCULPAS. SÓ EVOLUÇÃO.", subtitle: "Performance começa com constância e a suplementação certa.", tag: "ALFA PERFORMANCE", active: true },
    { id: "combo-week", title: "COMBO DA SEMANA", subtitle: "Whey + Creatina com condição especial enquanto durar o estoque.", tag: "OFERTA LIMITADA", active: true }
  ],
  campaigns: [
    { id: "v8-massa", title: "PROJETO MASSA", subtitle: "Whey + creatina: uma dupla prática para complementar sua rotina de performance.", tag: "STACK ALFA", cta: "VER PRODUTOS", target: "#produtos", theme: "orange", active: true, startAt: null, endAt: null, weekdays: [0,1,2,3,4,5,6] },
    { id: "v8-pix", title: "PIX COM CONDIÇÃO ESPECIAL", subtitle: "Selecione PIX no carrinho e veja o desconto configurado pela loja antes de enviar o pedido.", tag: "ECONOMIA", cta: "MONTAR CARRINHO", target: "#produtos", theme: "graphite", active: true, startAt: null, endAt: null, weekdays: [0,1,2,3,4,5,6] },
    { id: "v8-weekend", title: "FIM DE SEMANA ALFA", subtitle: "Campanha programável: o painel permite ativar chamadas por período e dias da semana.", tag: "CAMPANHA PROGRAMADA", cta: "CONFERIR", target: "#produtos", theme: "white", active: true, startAt: null, endAt: null, weekdays: [5,6,0] }
  ],
  coupons: [
    { code: "ALFA10", type: "percent", value: 10, minOrder: 120, active: true, label: "10% OFF" },
    { code: "PRIMEIRACOMPRA", type: "fixed", value: 15, minOrder: 100, active: true, label: "R$ 15 OFF" }
  ],
  products: [
    {
      id: 1, slug: "whey-premium-900g", sku: "ALF-WHEY-900", name: "100% Whey Premium 900g", brand: "Alfa Performance", category: "Proteínas",
      price: 119.90, costPrice: 74.34,oldPrice: 139.90, stock: 18, featured: true, bestseller: true, launch: false, badge: "MAIS VENDIDO", pack: "orange", rating: 4.9, reviewsCount: 128,
      description: "Proteína concentrada para recuperação, manutenção e ganho de massa muscular.",
      longDescription: "Whey protein concentrado pensado para complementar a ingestão diária de proteínas com praticidade. Ideal para pós-treino ou para refeições em que seja necessário aumentar o aporte proteico.",
      benefits: ["Alta concentração proteica", "Praticidade no pós-treino", "Excelente custo-benefício", "Mistura fácil"],
      flavors: ["Chocolate", "Baunilha", "Morango", "Cookies"], sizes: ["900g"], image: null
    },
    {
      id: 2, slug: "creatina-monohidratada-300g", sku: "ALF-CREA-300", name: "Creatina Monohidratada 300g", brand: "Alfa Performance", category: "Creatinas",
      price: 89.90, costPrice: 55.74,oldPrice: 99.90, stock: 25, featured: true, bestseller: true, launch: false, badge: "TOP", pack: "silver", rating: 5.0, reviewsCount: 203,
      description: "Força, potência e desempenho para treinos intensos.",
      longDescription: "Creatina monohidratada para atletas e praticantes de atividade física que buscam complementar a rotina de treino com um dos suplementos mais estudados do esporte.",
      benefits: ["Suporte à força", "Desempenho em alta intensidade", "Uso diário simples", "Sem sabor"],
      flavors: ["Sem sabor"], sizes: ["300g"], image: null
    },
    {
      id: 3, slug: "pre-treino-insano-300g", sku: "ALF-PRE-300", name: "Pré-Treino Insano 300g", brand: "Alpha Labs", category: "Pré-treinos",
      price: 79.90, costPrice: 49.54,oldPrice: 94.90, stock: 11, featured: true, bestseller: false, launch: false, badge: "ENERGIA", pack: "dark", rating: 4.8, reviewsCount: 74,
      description: "Energia, foco e disposição do início ao fim do treino.",
      longDescription: "Blend pré-treino desenvolvido para quem busca intensidade. Escolha o sabor e confirme a disponibilidade com nossa equipe no WhatsApp.",
      benefits: ["Foco para o treino", "Energia e disposição", "Sabores marcantes", "Dose prática"],
      flavors: ["Frutas Vermelhas", "Limão", "Tangerina"], sizes: ["300g"], image: null
    },
    {
      id: 4, slug: "multivitaminico-az-120", sku: "ALF-VITA-120", name: "Multivitamínico A-Z 120 caps", brand: "Alfa Health", category: "Vitaminas",
      price: 49.90, costPrice: 30.94,oldPrice: null, stock: 32, featured: false, bestseller: false, launch: false, badge: "SAÚDE", pack: "white", rating: 4.7, reviewsCount: 61,
      description: "Suporte diário com vitaminas e minerais essenciais.",
      longDescription: "Fórmula multivitamínica para complementar a alimentação e tornar a rotina mais prática. Consulte a composição do rótulo antes do uso.",
      benefits: ["Uso diário", "Vitaminas e minerais", "Formato em cápsulas", "Praticidade"],
      flavors: ["Cápsulas"], sizes: ["120 cápsulas"], image: null
    },
    {
      id: 5, slug: "whey-isolado-pro-900g", sku: "ALF-ISO-900", name: "Whey Isolado Pro 900g", brand: "Alfa Performance", category: "Proteínas",
      price: 159.90, costPrice: 99.14,oldPrice: 179.90, stock: 8, featured: true, bestseller: false, launch: true, badge: "LANÇAMENTO", pack: "silver", rating: 5.0, reviewsCount: 42,
      description: "Alta concentração proteica e excelente digestibilidade.",
      longDescription: "Opção premium para quem busca maior concentração de proteína por porção. Um produto de destaque para rotinas focadas em performance e praticidade.",
      benefits: ["Alta concentração de proteína", "Perfil premium", "Mistura rápida", "Vários sabores"],
      flavors: ["Chocolate Belga", "Baunilha", "Cappuccino"], sizes: ["900g"], image: null
    },
    {
      id: 6, slug: "creatina-pure-150g", sku: "ALF-CREA-150", name: "Creatina Pure 150g", brand: "Alfa Performance", category: "Creatinas",
      price: 54.90, costPrice: 34.04,oldPrice: 64.90, stock: 17, featured: false, bestseller: false, launch: false, badge: "OFERTA", pack: "orange", rating: 4.8, reviewsCount: 89,
      description: "Creatina pura em formato compacto para sua rotina.",
      longDescription: "Versão compacta para quem quer começar ou manter o uso diário com praticidade.",
      benefits: ["Pote compacto", "Sem sabor", "Uso diário", "Ótimo custo inicial"],
      flavors: ["Sem sabor"], sizes: ["150g"], image: null
    },
    {
      id: 7, slug: "alpha-fire-200g", sku: "ALF-FIRE-200", name: "Pré-Treino Alpha Fire 200g", brand: "Alpha Labs", category: "Pré-treinos",
      price: 69.90, costPrice: 43.34,oldPrice: null, stock: 6, featured: false, bestseller: false, launch: true, badge: "NOVO", pack: "dark", rating: 4.9, reviewsCount: 31,
      description: "Fórmula para foco, intensidade e treino explosivo.",
      longDescription: "Pré-treino compacto com identidade intensa para treinos em que foco e disposição são prioridade.",
      benefits: ["Foco", "Intensidade", "Pote compacto", "Sabores cítricos"],
      flavors: ["Limão Ice", "Laranja"], sizes: ["200g"], image: null
    },
    {
      id: 8, slug: "omega-3-ultra-120", sku: "ALF-OMG-120", name: "Ômega 3 Ultra 120 caps", brand: "Alfa Health", category: "Vitaminas",
      price: 59.90, costPrice: 37.14,oldPrice: null, stock: 21, featured: false, bestseller: false, launch: false, badge: "ESSENCIAL", pack: "white", rating: 4.8, reviewsCount: 96,
      description: "Complemento nutricional para uma rotina equilibrada.",
      longDescription: "Suplemento em cápsulas para complementar a alimentação. Consulte a quantidade de EPA/DHA no rótulo e confirme dúvidas com um profissional habilitado.",
      benefits: ["Formato em cápsulas", "Rotina prática", "120 cápsulas", "Linha Alfa Health"],
      flavors: ["Cápsulas"], sizes: ["120 cápsulas"], image: null
    },
    {
      id: 9, slug: "hipercalorico-mass-3kg", sku: "ALF-MASS-3K", name: "Mass Builder Hipercalórico 3kg", brand: "Alfa Performance", category: "Hipercalóricos",
      price: 109.90, costPrice: 68.14,oldPrice: 124.90, stock: 12, featured: true, bestseller: false, launch: true, badge: "NOVO", pack: "orange", rating: 4.7, reviewsCount: 29,
      description: "Calorias e praticidade para complementar dietas de ganho de peso.",
      longDescription: "Hipercalórico para complementar a ingestão energética em rotinas de alto gasto ou estratégias nutricionais de ganho de peso.",
      benefits: ["Alta densidade calórica", "Porção prática", "Ideal para bulking", "Sabores variados"],
      flavors: ["Chocolate", "Baunilha"], sizes: ["3kg"], image: null
    },
    {
      id: 10, slug: "bcaa-recovery-120", sku: "ALF-BCAA-120", name: "BCAA Recovery 120 caps", brand: "Alfa Performance", category: "Aminoácidos",
      price: 64.90, costPrice: 40.24,oldPrice: 72.90, stock: 15, featured: false, bestseller: false, launch: false, badge: "RECOVERY", pack: "silver", rating: 4.6, reviewsCount: 48,
      description: "Aminoácidos em cápsulas para complementar a rotina esportiva.",
      longDescription: "Opção em cápsulas para quem valoriza praticidade no dia a dia e deseja complementar a alimentação com aminoácidos.",
      benefits: ["Cápsulas práticas", "Fácil transporte", "Linha performance", "Rotina simplificada"],
      flavors: ["Cápsulas"], sizes: ["120 cápsulas"], image: null
    },
    {
      id: 11, slug: "barra-protein-crunch", sku: "ALF-BAR-60", name: "Protein Crunch Bar 60g", brand: "Alfa Foods", category: "Snacks",
      price: 12.90, costPrice: 8.00,oldPrice: 14.90, stock: 40, featured: false, bestseller: true, launch: false, badge: "SNACK", pack: "dark", rating: 4.9, reviewsCount: 117,
      description: "Snack proteico prático para levar na bolsa ou mochila.",
      longDescription: "Barra proteica para momentos em que praticidade faz diferença. Escolha o sabor e adicione quantas unidades quiser ao carrinho.",
      benefits: ["Prática", "Fonte de proteína", "Fácil transporte", "Ótima para lanches"],
      flavors: ["Chocolate", "Cookies", "Caramelo"], sizes: ["60g"], image: null
    },
    {
      id: 12, slug: "pasta-amendoim-power-1kg", sku: "ALF-PASTA-1K", name: "Pasta de Amendoim Power 1kg", brand: "Alfa Foods", category: "Snacks",
      price: 39.90, costPrice: 24.74,oldPrice: null, stock: 19, featured: false, bestseller: true, launch: false, badge: "QUERIDINHA", pack: "orange", rating: 4.9, reviewsCount: 166,
      description: "Pasta de amendoim para receitas, lanches e rotina esportiva.",
      longDescription: "Uma opção versátil para cafés da manhã, lanches e receitas. Confira ingredientes e informações nutricionais no rótulo.",
      benefits: ["Versátil", "Pote de 1kg", "Combina com receitas", "Textura cremosa"],
      flavors: ["Tradicional", "Cacau", "Cookies"], sizes: ["1kg"], image: null
    }
  ],
  combos: [
    { id: "combo-start", name: "Combo Start", productIds: [1, 2], discountPercent: 7, badge: "COMECE FORTE", description: "Whey Premium + Creatina 300g" },
    { id: "combo-fire", name: "Combo Treino Insano", productIds: [2, 3], discountPercent: 8, badge: "INTENSIDADE", description: "Creatina + Pré-Treino" },
    { id: "combo-completo", name: "Combo Evolução Total", productIds: [1, 2, 3], discountPercent: 10, badge: "MAIOR ECONOMIA", description: "Whey + Creatina + Pré-Treino" }
  ],
  orders: [],
  customers: [],
  stockMovements: [],
  reviews: [
    { id: 1, name: "Carlos M.", rating: 5, text: "Atendimento rápido e pedido já vai pronto para o WhatsApp. Muito prático.", product: "100% Whey Premium" },
    { id: 2, name: "Renata S.", rating: 5, text: "Gostei dos filtros e das opções de sabor. Facilita demais para escolher.", product: "Whey Isolado Pro" },
    { id: 3, name: "João V.", rating: 5, text: "A creatina chegou certinho e o atendimento resolveu tudo pelo WhatsApp.", product: "Creatina 300g" }
  ]
};

window.AlfaStore = {
  key: "alfa_v4_store",
  previousKeys: ["alfa_v3_store", "alfa_v2_store"],
  load() {
    try {
      let raw = localStorage.getItem(this.key);
      if (!raw) {
        for (const oldKey of this.previousKeys) {
          const legacy = localStorage.getItem(oldKey);
          if (legacy) { raw = legacy; break; }
        }
      }
      const saved = raw ? JSON.parse(raw) : null;
      const base = structuredClone(window.ALFA_DEFAULT_DATA);
      if (!saved) return base;
      const merged = {
        ...base,
        ...saved,
        settings: { ...base.settings, ...(saved.settings || {}) },
        products: Array.isArray(saved.products) ? saved.products : base.products,
        banners: Array.isArray(saved.banners) ? saved.banners : base.banners,
        coupons: Array.isArray(saved.coupons) ? saved.coupons : base.coupons,
        campaigns: Array.isArray(saved.campaigns) ? saved.campaigns : base.campaigns,
        combos: Array.isArray(saved.combos) ? saved.combos : base.combos,
        reviews: Array.isArray(saved.reviews) ? saved.reviews : base.reviews,
        orders: Array.isArray(saved.orders) ? saved.orders : [],
        customers: Array.isArray(saved.customers) ? saved.customers : [],
        stockMovements: Array.isArray(saved.stockMovements) ? saved.stockMovements : []
      };
      localStorage.setItem(this.key, JSON.stringify(merged));
      return merged;
    } catch (error) {
      console.warn("Falha ao carregar dados locais. Restaurando padrão.", error);
      return structuredClone(window.ALFA_DEFAULT_DATA);
    }
  },
  save(data) {
    localStorage.setItem(this.key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("alfa:data-updated", { detail: data }));
  },
  reset() {
    localStorage.removeItem(this.key);
    return this.load();
  },
  export(data) {
    return JSON.stringify({ version: 8, exportedAt: new Date().toISOString(), data }, null, 2);
  },
  import(payload) {
    const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
    const data = parsed?.data || parsed;
    if (!data || !Array.isArray(data.products)) throw new Error("Backup inválido");
    this.save(data);
    return this.load();
  }
};
