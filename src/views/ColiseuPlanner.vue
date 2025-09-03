<template>
    <div class="tierlist-container">
        <div class="ligas-columns">
            <!-- Coluna de origem -->
            <div class="ligas" @dragover.prevent>
                <h2>Oponentes</h2>
                <img v-for="card in ligas.Oponentes" :key="card.name" :src="require(`@/assets/cards/${card.image}`)"
                    :alt="`Card de ${card.name}`" class="coliseu-img" draggable="false"
                    @dragstart="onDragStart(card, 'Oponentes')" />

            </div>

            <!-- Coluna de destino -->
            <div class="ligas" @dragover.prevent @drop="onDrop('Picks')">
                <h2>Escolhas</h2>
                <div 
            v-for="card in ligas.Picks" 
            :key="card.name" 
            class="pick-card"
            :class="{ 'selected-pick': selectedPicks.includes(card.name) }"
            @click.stop="togglePickSelection(card.name)"
        >
            <img 
                :src="require(`@/assets/cards/${card.image}`)"
                :alt="`Card de ${card.name}`" 
                class="coliseu-img" 
                draggable="true"
                @dragstart="onDragStart(card, 'Picks')" 
            />
        </div>
            </div>
        </div>
        <!-- Coluna de Personagens -->
        <div class="personagens-container" @dragover.prevent @drop="onDrop('personagens')">
            <h2>Todos os Personagens</h2>
            <div class="personagem-list">

                <div v-for="personagem in sortedPersonagens" :key="personagem.id" class="personagem-card">
        <img :src="personagem && personagem.nome
          ? require(`@/assets/cards/Card-${personagem.nome.toLowerCase().replace(/\s+/g, '')}.png`)
          : require('@/assets/cards/Card-branco.png')" 
          :alt="personagem && personagem.nome ? `Card de ${personagem.nome}` : 'Card em branco'" 
          loading="lazy" 
          class="coliseu-img" 
          draggable="true"
          @dragstart="onDragStart(personagem, 'personagens')" />
                </div>
            </div>
        </div>



    </div>
</template>

<script>
import axios from 'axios';
export default {
    data() {
        return {
            selectedPicks: [],
            personagens: [],
            allPersonagens: [],
            ligas: {
                Picks: [],

                Oponentes: [
                    { name: "Alvida", image: "Card-alvida.png" },
                    { name: "Morgan", image: "Card-morgan.png" },
                    { name: "Mohji", image: "Card-mohji.png" },
                    { name: "Cabaji", image: "Card-cabaji.png" },
                    { name: "Buggy", image: "Card-buggy.png" },
                    { name: "Jango", image: "Card-jango.png" },
                    { name: "Buchi", image: "Card-buchi&sham.png" },
                    { name: "Kuro", image: "Card-kuro.png" },
                    { name: "Pearl", image: "Card-pearl.png" },
                    { name: "Gin", image: "Card-gin.png" },
                    { name: "Don Krieg", image: "Card-donkrieg.png" },
                    { name: "Chew", image: "Card-chew.png" },
                    { name: "Hatchan", image: "Card-hatchan.png" },
                    { name: "Kuroobi", image: "Card-kuroobi.png" },
                    { name: "Arlong", image: "Card-arlong.png" },
                    { name: "Eric", image: "Card-eric.png" },
                    { name: "Mr. 5", image: "Card-mr.5.png" },
                    { name: "Mr. 4", image: "Card-mr.4.png" },
                    { name: "Goldenweek", image: "Card-missgoldenweek.png" },
                    { name: "Mr. 3", image: "Card-mr.3.png" },
                    { name: "Mr. 2", image: "Card-mr.2.png" },
                    { name: "Doublefinger", image: "Card-missdoublefinger.png" },
                    { name: "Mr. 1", image: "Card-mr.1.png" },
                    { name: "Crocodile", image: "Card-crocodile.png" },
                    { name: "Wapol", image: "Card-wapol.png" },
                    { name: "Daddy", image: "Card-daddy.png" },
                    { name: "Tashigi", image: "Card-tashigi.png" },
                    { name: "Smoker", image: "Card-smoker.png" },
                    { name: "Hina", image: "Card-hina.png" },
                    { name: "Drake", image: "Card-x-drake.png" },
                    { name: "Bastille", image: "Card-bastille.png" },
                    { name: "Dalmatian", image: "Card-dalmatian.png" },
                    { name: "Bepo", image: "Card-bepo.png" },
                    { name: "Law", image: "Card-trafalgarlaw.png" },
                    { name: "Hawkins", image: "Card-basilhawkins.png" },
                    { name: "Capone", image: "Card-caponegangbege.png" },
                    { name: "Apoo", image: "Card-scratchmenapoo.png" },
                    { name: "Urouge", image: "Card-urouge.png" },
                    { name: "killer", image: "Card-killer.png" },
                    { name: "Kid", image: "Card-eustasskid.png" },
                    { name: "Vivi", image: "Card-vivi.png" },
                    { name: "Rebecca", image: "Card-rebecca.png" },
                    { name: "Perona", image: "Card-perona.png" },
                    { name: "Leo", image: "Card-leo&mansherry.png" },
                    { name: "Yonji", image: "Card-vinsmokeyonji.png" },
                    { name: "Niji", image: "Card-vinsmokeniji.png" },
                    { name: "Reiju", image: "Card-vinsmokereiju.png" },
                    { name: "Ichiji", image: "Card-vinsmokeichiji.png" },
                    { name: "Bonney", image: "Card-jewelrybonney.png" },
                    { name: "Usopp", image: "Card-usopp.png" },
                    { name: "Nami", image: "Card-nami.png" },
                    { name: "Chopper", image: "Card-chopper.png" },
                    { name: "Brook", image: "Card-brook.png" },
                    { name: "Franky", image: "Card-franky.png" },
                    { name: "Robin", image: "Card-nicorobin.png" },
                    { name: "Sanji", image: "Card-vinsmokesanji.png" },
                    { name: "Zoro", image: "Card-roronoazoro.png" },
                    { name: "Luffy", image: "Card-monkeyd.luffy.png" },
                    { name: "Koala", image: "Card-koala.png" },
                    { name: "Bartolomeo", image: "Card-bartolomeo.png" },
                    { name: "Burgess", image: "Card-jesusburgess.png" },
                    { name: "Sabo", image: "Card-sabo.png" },

                ],
            },
            draggedCard: null,
            draggedFrom: null,
        };
    },
    watch: {
        
        'ligas.Picks': {
            handler(newPicks) {
                // Salva no LocalStorage sempre que Picks mudar
                localStorage.setItem('savedPicks', JSON.stringify(newPicks));
            },
            deep: true
        },
        selectedPicks: {
            handler(newVal) {
                localStorage.setItem('selectedPicks', JSON.stringify(newVal));
            },
            deep: true
        }
    },
    methods: {
        loadSelectedPicks() {
            const saved = localStorage.getItem('selectedPicks');
            if (saved) {
                try {
                    this.selectedPicks = JSON.parse(saved);
                } catch (e) {
                    console.error('Erro ao carregar seleções:', e);
                }
            }
        },
        togglePickSelection(cardName) {
            const index = this.selectedPicks.indexOf(cardName);
            if (index === -1) {
                this.selectedPicks.push(cardName);
            } else {
                this.selectedPicks.splice(index, 1);
            }
        },
        async fetchPersonagem() {
            try {
                const response = await axios.get("http://localhost:3000/personagenslista");
                this.allPersonagens = response.data;
                
                // Carrega os picks salvos primeiro
                this.loadSavedPicks();
                
                // Filtra personagens removendo os que já estão nos picks
                this.personagens = this.allPersonagens.filter(personagem => 
                    !this.ligas.Picks.some(pick => pick.name === personagem.nome)
                );
            } catch (error) {
                console.error("Erro ao carregar os personagens:", error);
                if (error.response) {
                    console.error("Resposta do servidor:", error.response.status, error.response.data);
                } else if (error.request) {
                    console.error("Nenhuma resposta do servidor:", error.request);
                } else {
                    console.error("Erro na configuração da requisição:", error.message);
                }
            }
        },
        loadSavedPicks() {
            const saved = localStorage.getItem('savedPicks');
            if (saved) {
                try {
                    // Remove duplicatas e mantém apenas dados válidos
                    const parsed = JSON.parse(saved);
                    const uniquePicks = parsed.reduce((acc, current) => {
                        if (!acc.some(pick => pick.name === current.name)) {
                            acc.push(current);
                        }
                        return acc;
                    }, []);
                    
                    this.ligas.Picks = uniquePicks;
                } catch (e) {
                    console.error('Erro ao carregar Picks salvos:', e);
                }
            }
        },
        onDragStart(card, from) {
            // Impede arrastar de Oponentes se necessário
            if (from === 'Oponentes') {
                this.draggedCard = card;
                this.draggedFrom = from;
            } else {
                // Lógica normal para outras origens
                this.draggedCard = card;
                this.draggedFrom = from;
            }
        },

        onDrop(to) {
            const validDestinations = ['Picks', 'personagens'];
            if (!validDestinations.includes(to)) {
                console.error(`Destino inválido: ${to}`);
                return;
            }

            if (this.draggedCard && this.draggedFrom !== to) {
                // Remover da origem
                if (this.draggedFrom === 'personagens') {
                    // Movendo de personagens para outra coluna
                    this.personagens = this.personagens.filter(p => p.id !== this.draggedCard.id);
                    const cardToAdd = {
                        name: this.draggedCard.nome,
                        image: `Card-${this.draggedCard.nome.toLowerCase().replace(/\s+/g, '')}.png`
                    };
                    this.ligas[to].push(cardToAdd);
                } else if (to === 'personagens') {
                    // Movendo de volta para personagens
                    const sourceList = this.ligas[this.draggedFrom];
                    const cardIndex = sourceList.findIndex(c => c.name === this.draggedCard.name);

                    if (cardIndex > -1) {
                        sourceList.splice(cardIndex, 1);
                        // Recuperar o personagem original da lista completa
                        const originalPersonagem = this.personagens.find(
                            p => p.nome === this.draggedCard.name
                        ) || {
                            id: Date.now(), // ID temporário se não encontrar
                            nome: this.draggedCard.name
                        };

                        this.personagens.push(originalPersonagem);
                    }
                } else {
                    // Movendo entre colunas (Oponentes <-> Picks)
                    const sourceList = this.ligas[this.draggedFrom];
                    const cardIndex = sourceList.findIndex(c => c.name === this.draggedCard.name);

                    if (cardIndex > -1) {
                        const [movedCard] = sourceList.splice(cardIndex, 1);
                        this.ligas[to].push(movedCard);
                    }
                }

                this.draggedCard = null;
                this.draggedFrom = null;
            }
        }

        ,
    },
    mounted() {
        this.loadSelectedPicks();
        this.fetchPersonagem();
        this.loadSavedPicks(); // Carrega os dados salvos
    },
    computed: {
    sortedPersonagens() {
      // Ordena os personagens alfabeticamente
      return [...this.personagens].sort((a, b) => {
        return a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' });
      });
    }
  },
};
</script>

<style>
.pick-card {
    margin: 0 0;
    padding: 0 0;
    position: relative;
    cursor: pointer;
    transition: all 0.2s;
}

.pick-card.selected-pick::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(144, 238, 144, 0.5);
    border-radius: 4px;
}

.ligas {
    padding: 10px 0; /* Remove padding lateral */
    gap: 0; /* Remove espaçamento entre os cards */
}
.ligas img {
    width: 100%;
    height: auto; /* Altura fixa */
    display: block; /* Remove espaçamento fantasma abaixo da imagem */
    margin: 0;
    object-fit: cover;
}
.tierlist-container {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    width: 100%;
    /* Garante que o container ocupe toda a largura */
}

/* Container das colunas laterais */
.ligas-columns {
    display: flex;
    flex-direction: row;
    /* Colunas lado a lado */
    gap: 20px;
    width: 100%;
    /* Garante que as colunas ocupem toda a largura disponível */
    padding: 10px;
}

/* Oponentes e Picks: Colunas laterais */
.ligas {
    width: 200px;
    /* Definir largura fixa para colunas finas */
    padding: 10px;
    min-height: 300px;
    display: flex;
    flex-direction: column;
    gap: 1px;
    flex-shrink: 0;
    /* Impede encolhimento da coluna */
}


/* Quando a imagem for arrastada para a coluna 'Escolhas' */
.ligas img.dragged {
    width: 100px;
    /* Ou qualquer tamanho fixo que você queira */
    height: 150px;
    /* Ou qualquer tamanho fixo que você queira */
}


/* Container de personagens (área principal) */
.personagens-container {
    flex-grow: 1;
    /* Garante que a área principal ocupe o espaço restante */
    min-width: 60%;
    /* Definir largura mínima para a área de personagens */
    padding: 2px;
}

/* Grid de personagens */
.personagem-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 2px;
    width: 100%;
}

/* Tamanho uniforme para as imagens */
.coliseu-img {
    width: 100%;
    height: 100%;
    /* Define uma altura fixa */
    object-fit: cover;
    /* Garante que a imagem se ajuste bem */
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    /* Sombra leve */
    cursor: grab;
}

/* Ajuste para telas pequenas */
@media (max-width: 768px) {
    .tierlist-container {
        flex-direction: column;
        /* Colunas empilhadas em telas pequenas */
    }

    .ligas-columns {
        flex-direction: column;
        /* Empilha as colunas de Oponentes e Picks */
    }

    .ligas {
        width: 100%;
        /* Coluna de oponentes ocupa 100% da tela em dispositivos pequenos */
    }

    .personagens-container {
        min-width: 100%;
        /* Garante que a coluna de personagens ocupe toda a largura */
    }
}
</style>