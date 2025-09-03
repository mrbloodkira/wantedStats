<template>
  <div class="page-container">

    <div class="enemy">
      <img :src="selectboxWanted && selectboxWanted.nomeWanted
        ? require(`@/assets/cards/Card-${selectboxWanted.nomeWanted.toLowerCase().replace(/\s+/g, '')}.png`)
        : require('@/assets/cards/Card-branco.png')" :alt="selectboxWanted && selectboxWanted.nomeWanted
          ? `Card de ${selectboxWanted.nomeWanted}`
          : 'Card em branco'" loading="lazy" class="personagem-img" />

      <select v-model="selectboxWantedId" id="selectbox-wanted" @change="handleWantedChange">
  <option value="" disabled selected>Selecione o Wanted!</option>
  <option v-for="wanted in wanteds" :key="wanted.idWanted" :value="wanted.idWanted">
    {{ wanted.nomeWanted }}
  </option>
</select>
    </div>

    <!-- Colunas de classes -->
    <div v-if="selectboxWanted" class="columns">
      <div v-for="(classePersonagens, classe) in personagensPorClasse" :key="classe" class="column">
        <h2>{{ classe }}</h2>

        <div v-for="personagem in classePersonagens" :key="personagem.id" class="personagem-card"
          @click="setSelectedPersonagem(personagem)">
          <img :src="personagem && personagem.nome
            ? require(`@/assets/cards/Card-${personagem.nome.toLowerCase().replace(/\s+/g, '')}.png`)
            : require('@/assets/cards/Card-branco.png')" :alt="personagem && personagem.nome
              ? `Card de ${personagem.nome}`
              : 'Card em branco'" loading="lazy" class="personagem-img" />

          <div class="winrate">
            <div :style="{ width: `${winrates[personagem.id] || 0}%` }" class="winrate-percent">
              <div class="winrate-percent-number">
                {{ winrates[personagem.id] || 'N/A' }}%
              </div>
            </div>
          </div>

          <div class="record">
            <span class="comentarios-link" @click.stop="fetchComentarios(personagem)">
              <p>📝{{ personagem.comentarios }}</p>

              <p>🎥{{ personagem.gravacoes }}</p>
            </span>
          </div>

        </div>

      </div>
    </div>

    <!-- Modal Combate-->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <form @submit.prevent="addCombate">
          <div>
            <h3>WANTED:</h3>
            <img :src="selectboxWanted && selectboxWanted.nomeWanted
              ? require(`@/assets/cards/Card-${selectboxWanted.nomeWanted.toLowerCase().replace(/\s+/g, '')}.png`)
              : require('@/assets/cards/Card-branco.png')" :alt="selectboxWanted && selectboxWanted.nomeWanted
                ? `Card de ${selectboxWanted.nomeWanted}`
                : 'Card em branco'" loading="lazy" class="personagem-img" />
          </div>

          <div v-if="selectedPersonagem">
            <h2>VS</h2>
          </div>

          <div>
            <img
              :src="require(`@/assets/cards/Card-${modalData.personagem.nome.toLowerCase().replace(/\s+/g, '')}.png`)"
              :alt="`Card de ${modalData.personagem.nome}`" class="personagem-img" />
          </div>
          <div>

            <label for="resultado">Resultado:</label>
            <select v-model="modalData.resultado" required>
              <option value="" hidden>Selecione...</option>
              <option value="win">Vitória</option>
              <option value="loss">Derrota</option>
            </select>
          </div>

          <div>
            <label for="comentario">Comentário:</label>
            <textarea value="" v-model="modalData.comentario" id="comentario"></textarea>
          </div>

          <div>
            <label for="gravacao">Link da gravação:</label>
            <input v-model="modalData.gravacao" id="gravacao" type="text" placeholder="Código da gravação ou YouTube" />
          </div>
          <div class="modal-actions">

            <button type="button" @click="closeModal">Cancelar</button>
            <button type="submit">Salvar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Comentários-->
    <div v-if="showComentariosModal" class="modal-overlay">
      <div class="modal">
        <h3>Comentários e Gravações</h3>
        <ul v-if="comentariosList.length > 0">
          <li v-for="(comentario, index) in comentariosList" :key="index">
            <p v-if="comentario.comentario">📝 {{ comentario.comentario }}</p>
            <p v-if="comentario.gravacao">🎥 {{ comentario.gravacao }}</p>
            <hr />
          </li>
        </ul>
        <p v-else>Nenhum comentário ou gravação encontrado.</p>

        <button @click="showComentariosModal = false">Fechar</button>
      </div>
    </div>

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
      winrates: {},
      showModal: false,
      showComentariosModal: false,
      modalData: {
        wanted: '',
        personagem: '',
        resultado: '',
        comentario: '',
        gravacao: ''
      }
    }
  },
  computed: {
    wantedNomes() {
      return [...new Set(this.wanteds.map(wanted => wanted.nomeWanted))];
    },
    personagensNomes() {
      return [...new Set(this.personagens.map(personagem => personagem.nome))];
    },
    personagensPorClasse() {
      // Definir as classes fixas
      const classes = ['Lutador', 'Especialista', 'Atirador', 'Cortante'];

      // Inicializa um objeto para armazenar as colunas
      const grouped = {
        Lutador: [],
        Especialista: [],
        Atirador: [],
        Cortante: []
      };

      // Agrupa personagens nas classes corretas
      this.personagens.forEach(personagem => {
        // Verifica se o personagem possui a propriedade `classe`
        if (personagem.classe) {
          // Garantir que 'classe' seja uma string antes de dividir
          let personagemClasses = [];
          if (typeof personagem.classe === 'string') {
            // Caso seja uma string, divide as classes
            personagemClasses = personagem.classe.split(",").map(classe => classe.trim());
          } else if (Array.isArray(personagem.classe)) {
            // Se for um array, converta para string ou processar de outra forma
            personagemClasses = personagem.classe.map(classe => classe.trim());
          } else {
            console.warn(`O personagem ${personagem.nome} tem um valor inválido para a classe:`, personagem.classe);
          }

          // Agora, agrupa os personagens com base nas classes
          personagemClasses.forEach(classe => {
            if (classes.includes(classe)) {
              grouped[classe].push(personagem);
            }
          });
        } else {
          console.warn(`O personagem ${personagem.nome} não possui a propriedade "classe".`);
        }
      });

      return grouped;
    },

  },
  methods: {
    async fetchComentarios(personagem) {
      try {
        const response = await axios.get("http://localhost:3000/comentarios", {
          params: {
            wantedId: this.selectboxWanted.idWanted,
            personagemId: personagem.id
          }
        });
        this.comentariosList = response.data;
        this.showComentariosModal = true;
      } catch (error) {
        console.error("Erro ao carregar comentários:", error);
      }
    },

    async fetchWinrates(wantedId) {
      try {
        const response = await axios.get(`http://localhost:3000/personagens?wantedId=${wantedId}`);
        console.log("resposta da API:", response.data);

        const winrates = {};
        const personagens = [];

        // Certifique-se de que a estrutura de resposta contém 'classe'
        response.data.forEach(item => {
          // Verifique se os dados têm a propriedade 'classe' corretamente
          if (item.personagem_classe) {
            winrates[item.personagem_id] = item.winrate || 0;
            let personagemClasses = [];
            if (typeof item.personagem_classe === 'string') {
              personagemClasses = item.personagem_classe.split(","); // Divida as classes se houver mais de uma
            } else {
              console.warn(`O personagem fetchwinrate ${item.personagem_nome} possui um valor inválido para a classe.`);
            }
            personagens.push({
              id: item.personagem_id,
              nome: item.personagem_nome,
              classe: personagemClasses,
              comentarios: item.total_comentarios || 0,
              gravacoes: item.total_gravacoes || 0
            });
          } else {
            console.warn(`O personagem ${item.personagem_nome} não possui a propriedade "classe".`);
          }
        });

        this.winrates = winrates;
        this.personagens = personagens;

        console.log("Winrates carregados:", this.winrates);
        console.log("Personagens carregados:", this.personagens);


      } catch (error) {
        console.error("Erro ao buscar winrates:", error);
      }
    },

    async handleWantedChange() {
      this.selectboxWanted = this.wanteds.find(
        w => w.idWanted === this.selectboxWantedId
      );
      if (this.selectboxWanted) {
        this.fetchWinrates(this.selectboxWanted.idWanted);
      }
    },

    async fetchWanted() {
      try {
        const response = await axios.get("http://localhost:3000/wanteds");
        this.wanteds = response.data;
      } catch (error) {
        console.error("Erro ao carregar wanted:", error);
      }
    },

    setSelectedPersonagem(personagem) {
      this.selectedPersonagem = personagem;
      this.openModal(personagem);
    },

    openModal(personagem) {
      this.modalData.wanted = this.selectboxWanted;
      this.modalData.personagem = personagem;
      this.modalData.resultado = ""; // Reseta o resultado
      this.showModal = true; // Exibe o modal
    },

    closeModal() {
      this.showModal = false; // Fecha o modal
    },

    async addCombate() {
      try {
        const { wanted, personagem, resultado } = this.modalData;
        if (!wanted || !personagem || !resultado) {
          alert("Preencha todos os campos!");
          return;
        }
        await axios.post("http://localhost:3000/combates", {
          wanted_id: this.selectboxWanted.idWanted,
          personagem_id: personagem.id,
          resultado: this.modalData.resultado,
          comentario: this.modalData.comentario || null,
          gravacao: this.modalData.gravacao || null
        });
        alert("Combate adicionado com sucesso!");
        this.modalData.comentario = '';
        this.modalData.gravacao = '';
        this.closeModal();

        // Atualiza os dados após adicionar o combate
        await this.fetchWinrates(this.selectboxWanted.idWanted);
      } catch (error) {
        console.error("Erro ao adicionar combate:", error);
        alert("Erro ao salvar o combate.");
      }
    }
  },

  mounted() {
    this.fetchWanted(); // Carrega os wanteds na inicialização
  }
};
</script>

<style>
.winrate {
  width: 160px;
  height: 10px;
  background-color: red;
  border-radius: 2px;
  overflow: hidden;
  margin-left: 0 auto;
}

.winrate-percent {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgb(98, 255, 98);
  height: 100%;
}

.winrate-percent-number {
  margin: 0 auto;
  font-size: 11px;
  text-align: center;
  display: block;

}


.page-container {
  display: flex;
  flex-direction: column;
  /* Organiza em coluna para alinhar tudo verticalmente */
  align-items: center;
  gap: 20px;
  /* Espaço entre elementos */
  margin: 10px;
}

.modal {
  background: whitesmoke;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 400px;
  /* aumentei de 300px para 400px */
  max-width: 90%;
  /* garante responsividade em telas pequenas */
  text-align: center;
  word-wrap: break-word;
  /* quebra palavras longas */
  overflow-wrap: break-word;
  /* para compatibilidade */
}

.modal ul {
  max-height: 60vh;
  /* limita altura e permite scroll */
  overflow-y: auto;
  padding-left: 0;
  list-style: none;
}

.modal li {
  text-align: left;
  margin-bottom: 10px;
}

.modal-actions {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
}

.modal-actions button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions button[type="submit"] {
  background-color: #28a745;
  color: white;
}

.modal-actions button[type="button"] {
  background-color: #dc3545;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  /* Fundo semitransparente */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.enemy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  /* Espaço entre o select e a imagem */
}

.columns {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  /* Cria 4 colunas */
  gap: 20px;
  /* Espaço entre as colunas */
  width: 100%;
  /* Ocupa toda a largura disponível */
  max-width: 1200px;
  /* Limita a largura máxima */
}

.column {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  background-color: #f9f9f9;
}

.personagem-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;
  margin-top: 0;
  margin-bottom: 15px;
}

.personagem-img {
  width: 80%;
  height: auto;
  margin-bottom: 5px;
}

select,
textarea,
input {
  appearance: none;
  width: 60%;
  font-size: 1rem;
  padding: 0.675em 1em;
  background-color: #fff;
  border: 1px solid #caced1;
  border-radius: 0.25rem;
  color: #000;
  cursor: pointer;
  margin: 0 auto;
  display: block;
}

.record {
  position: absolute;
  top: 11px;
  right: 0px;
  font-size: 14px;
}

option {
  text-align: center;
}

.comentarios-link {
  cursor: pointer;
}
</style>