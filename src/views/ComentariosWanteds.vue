<template>
    <div class="page-container">
        <h2>Dicas e comentários!</h2>
        <div class="enemy">
            <img :src="selectboxWanted && selectboxWanted.nomeWanted
                ? require(`@/assets/cards/Card-${selectboxWanted.nomeWanted.toLowerCase().replace(/\s+/g, '')}.png`)
                : require('@/assets/cards/Card-branco.png')" :alt="selectboxWanted && selectboxWanted.nomeWanted
                    ? `Card de ${selectboxWanted.nomeWanted}`
                    : 'Card em branco'" loading="lazy" class="personagem-img" />

            <select v-model="selectboxWantedId" id="selectbox-wanted" @change="handleWantedChange">
                <option value="" disabled>Selecione o Wanted!</option>
                <option v-for="wanted in wanteds" :key="wanted.idWanted" :value="wanted.idWanted">
                    {{ wanted.nomeWanted }}
                </option>
            </select>
        </div>

        <ul class="comentarios-list" v-if="selectboxWanted && comentariosList.length">
            <li v-for="(c, index) in comentariosList" :key="index" class="comentario-item">
                <div class="personagem-info">
                    <img :src="c.personagem_nome
                        ? require(`@/assets/cards/Card-${c.personagem_nome.toLowerCase().replace(/\s+/g, '')}.png`)
                        : require('@/assets/cards/Card-branco.png')"
                        :alt="c.personagem_nome ? `Card de ${c.personagem_nome}` : 'Card em branco'"
                        class="comentario-img" />
                    <p class="personagem-nome">{{ c.personagem_nome }}</p>
                </div>
                <div class="comentario-texto">
                    <p v-if="c.comentario">📝 {{ c.comentario }}</p>
                    <p v-if="c.gravacao">🎥 {{ c.gravacao }}</p>
                </div>
            </li>
        </ul>
        <p v-else-if="selectboxWanted && comentariosList.length === 0">Nenhum comentário ou gravação encontrado.</p>

    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            wanteds: [], // Lista de wanteds
            personagens: [],
            selectboxWantedId: "", // Wanted selecionado
            selectboxWanted: null, // Wanted selecionado
            selectedPersonagem: null,
            comentariosList: [],

        }
    },
    computed: {

        wantedNomes() {
            return [...new Set(this.wanteds.map(wanted => wanted.nomeWanted))];
        },
        personagensNomes() {
            return [...new Set(this.personagens.map(personagem => personagem.nome))];
        },
    },
    mounted() {
        this.fetchWanted();
    },
    methods: {
        async fetchComentariosWanted() {
            if (!this.selectboxWantedId) return;

            try {
                const response = await axios.get("http://localhost:3000/comentarios-wanted", {
                    params: { wantedId: this.selectboxWantedId }
                });
                this.comentariosList = response.data;
            } catch (err) {
                console.error("Erro ao buscar comentários do Wanted:", err);
            }
        },

        async handleWantedChange() {
            this.selectboxWanted = this.wanteds.find(
                w => w.idWanted === this.selectboxWantedId
            );
            if (this.selectboxWanted) {
                await this.fetchComentariosWanted();
            }
        },

        async fetchWanted() {
            try {
                const response = await axios.get("http://localhost:3000/wanteds");
                console.log("Wanteds recebidos:", response.data);
                this.wanteds = response.data;
            } catch (error) {
                console.error("Erro ao carregar wanted:", error);
            }
        },

        setSelectedPersonagem(personagem) {
            this.selectedPersonagem = personagem;
            this.openModal(personagem);
        },
    }
};
</script>

<style>
h2 {
    margin: 0 0;
    padding: 0 0;
}

.comentarios-list {
    list-style: none;
    /* remove os bullets */
    padding: 0;
    margin: 0;
}

.comentario-item {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    /* espaço entre a imagem e o texto */
    margin-bottom: 20px;
    border-bottom: 1px solid #ddd;
    /* separa os itens */
    padding-bottom: 10px;
}

.comentario-texto p {
    word-wrap: break-word;
    /* força a quebra de palavras longas */
    overflow-wrap: break-word;
    white-space: pre-wrap;
    /* mantém quebras de linha do texto original */
    word-break: break-word;
}

.personagem-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 80px;
    /* largura fixa para as imagens */
}

.comentario-img {
    width: 96px;
    height: 46px;
    object-fit: cover;
    border-radius: 4px;
    margin-bottom: 0px;
}

.personagem-nome {
    font-weight: bold;
    text-align: center;
    font-size: 0.9rem;
}

.comentario-texto {
    flex: 1;
}
</style>