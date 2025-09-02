/**
 * ActiveMenu - Módulo para gerenciar menu ativo automaticamente
 * Compatível com localhost e produção
 * Plug and play - apenas inclua e chame ActiveMenu.init()
 */

const ActiveMenu = {
    
    // Configurações padrão (podem ser personalizadas)
    config: {
        menuSelector: '.nav-link',           // Seletor dos links do menu
        activeClass: 'active',               // Classe CSS para item ativo
        homeFiles: ['index.html', ''],       // Arquivos considerados como "home"
        debug: true                        // Mostrar logs no console
    },
    
    /**
     * Inicializa o módulo
     * @param {Object} customConfig - Configurações personalizadas opcionais
     */
    init(customConfig = {}) {
        // Mesclar configurações personalizadas
        this.config = { ...this.config, ...customConfig };
        
        this.log('ActiveMenu inicializado');
        this.log('Configurações:', this.config);
        
        // Aguardar DOM carregar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setActiveMenu());
        } else {
            this.setActiveMenu();
        }
        
        // Escutar mudanças na URL (para SPAs ou navegação com hash)
        window.addEventListener('popstate', () => this.setActiveMenu());
        window.addEventListener('hashchange', () => this.setActiveMenu());
    },
    
    /**
     * Obtém informações sobre a página atual
     */
    getCurrentPageInfo() {
        const fullPath = window.location.pathname;
        const fileName = fullPath.split('/').pop() || '';
        const hash = window.location.hash;
        const search = window.location.search;
        
        const info = {
            fullPath,           // /pasta/arquivo.html
            fileName,           // arquivo.html
            fileNameOnly: fileName.replace('.html', ''), // arquivo
            hash,               // #secao
            search,             // ?param=valor
            isHome: this.isHomePage(fileName),
            isDevelopment: this.isDevelopment()
        };
        
        this.log('Informações da página atual:', info);
        return info;
    },
    
    /**
     * Verifica se é página home
     */
    isHomePage(fileName) {
        return this.config.homeFiles.includes(fileName) || 
               this.config.homeFiles.includes(fileName.replace('.html', ''));
    },
    
    /**
     * Verifica se está em ambiente de desenvolvimento
     */
    isDevelopment() {
        const host = window.location.hostname;
        return host === 'localhost' || 
               host === '127.0.0.1' || 
               host.startsWith('192.168.') ||
               host.includes('local');
    },
    
    /**
     * Define qual menu deve estar ativo
     */
    setActiveMenu() {
        const pageInfo = this.getCurrentPageInfo();
        const menuLinks = document.querySelectorAll(this.config.menuSelector);
        
        if (!menuLinks.length) {
            this.log('Nenhum link de menu encontrado com o seletor:', this.config.menuSelector);
            return;
        }
        
        // Remove classe active de todos os links
        menuLinks.forEach(link => {
            link.classList.remove(this.config.activeClass);
        });
        
        // Encontra e ativa o link correto
        let activeLink = this.findActiveLink(menuLinks, pageInfo);
        
        if (activeLink) {
            activeLink.classList.add(this.config.activeClass);
            this.log('Link ativado:', activeLink.href, activeLink.textContent.trim());
        } else {
            this.log('Nenhum link correspondente encontrado para a página atual');
        }
    },
    
    /**
     * Encontra qual link deve estar ativo
     */
    findActiveLink(menuLinks, pageInfo) {
        for (let link of menuLinks) {
            const href = link.getAttribute('href');
            
            // Verifica diferentes tipos de links
            if (this.isLinkActive(href, pageInfo)) {
                return link;
            }
        }
        return null;
    },
    
    /**
     * Verifica se um link específico deve estar ativo
     */
    isLinkActive(href, pageInfo) {
        if (!href) return false;
        
        // Link com hash (#contatos, #catalogo)
        if (href.startsWith('#')) {
            return pageInfo.hash === href;
        }
        
        // Link absoluto ou relativo
        const hrefFileName = href.split('/').pop().split('?')[0].split('#')[0];
        
        // Página home
        if (pageInfo.isHome && this.config.homeFiles.includes(hrefFileName)) {
            return true;
        }
        
        // Comparação direta
        if (hrefFileName === pageInfo.fileName) {
            return true;
        }
        
        // Comparação sem extensão
        if (hrefFileName.replace('.html', '') === pageInfo.fileNameOnly) {
            return true;
        }
        
        return false;
    },
    
    /**
     * Atualiza menu manualmente (útil para chamadas externas)
     */
    update() {
        this.setActiveMenu();
    },
    
    /**
     * Ativa um item específico do menu
     */
    setActive(selector) {
        const menuLinks = document.querySelectorAll(this.config.menuSelector);
        const targetLink = document.querySelector(selector);
        
        if (!targetLink) {
            this.log('Link não encontrado:', selector);
            return false;
        }
        
        // Remove active de todos
        menuLinks.forEach(link => link.classList.remove(this.config.activeClass));
        
        // Adiciona active no target
        targetLink.classList.add(this.config.activeClass);
        
        this.log('Link ativado manualmente:', selector);
        return true;
    },
    
    /**
     * Log condicional (apenas se debug estiver ativo)
     */
    log(...args) {
        if (this.config.debug) {
            console.log('[ActiveMenu]', ...args);
        }
    },
    
    /**
     * Obtém configurações atuais
     */
    getConfig() {
        return { ...this.config };
    },
    
    /**
     * Atualiza configurações em tempo real
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.log('Configurações atualizadas:', this.config);
        this.setActiveMenu();
    }
};

// Auto-inicialização se não estiver sendo usado como módulo ES6
if (typeof module === 'undefined') {
    // Disponibilizar globalmente
    window.ActiveMenu = ActiveMenu;
    
    // Auto-inicializar com configurações padrão se não foi chamado manualmente
    document.addEventListener('DOMContentLoaded', function() {
        if (!ActiveMenu.initialized) {
            ActiveMenu.init();
            ActiveMenu.initialized = true;
        }
    });
}

// Para uso como módulo ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ActiveMenu;
}
