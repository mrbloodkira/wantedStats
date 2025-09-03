const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Configuração do banco de dados
const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_KGWXco9h1SBk@ep-floral-hat-acdssj4c-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false, // necessário no Neon
  },
});

// Verificar conexão com o banco
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Erro ao conectar ao banco de dados:", err.stack);
  }
  console.log("Conectado ao banco de dados NeonDB!");
  release();
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Rota para buscar personagens com winrate
app.get("/personagens", async (req, res) => {
  const wantedId = req.query.wantedId;

  if (!wantedId) {
    return res.status(400).send({ error: "Parâmetro wantedId é obrigatório" });
  }

  console.log("Wanted ID recebido:", wantedId);

  const query =  `
  SELECT 
  p.id AS "personagem_id",
  p.nome AS "personagem_nome",
  p.classe AS "personagem_classe",
  w.idwanted AS "wanted_id",
  w.nomewanted AS "wanted_nome",
  COUNT(CASE WHEN c.resultado = 'win' THEN 1 END) AS "vitorias",
  COUNT(c.id) AS "total_combat",
  ROUND(
    COALESCE(
      (COUNT(CASE WHEN c.resultado = 'win' THEN 1 END) * 100.0) / NULLIF(COUNT(c.id), 0),
      0
    ), 2
  ) AS "winrate",
  SUM(CASE WHEN c.comentario IS NOT NULL AND c.comentario != '' THEN 1 ELSE 0 END) AS "total_comentarios",
  SUM(CASE WHEN c.gravacao IS NOT NULL AND c.gravacao != '' THEN 1 ELSE 0 END) AS "total_gravacoes"
FROM personagem p
LEFT JOIN combates c 
  ON p.id = c.personagem_id 
  AND c.wanted_id = $1 
  AND c.data >= NOW() - INTERVAL '12 months'
LEFT JOIN wanted w 
  ON c.wanted_id = w.idwanted
GROUP BY p.id, w.idwanted, w.nomewanted
ORDER BY "winrate" DESC NULLS LAST;

`;

  try {
    const { rows } = await pool.query(query, [wantedId]);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar winrates:", err);
    res.status(500).send("Erro no servidor");
  }
});

// Rota para buscar wanteds
app.get("/wanteds", async (req, res) => {
  try {
    const { rows } = await pool.query(`
  SELECT 
    idwanted AS "idWanted", 
    nomewanted AS "nomeWanted" 
  FROM wanted
`);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar wanted:", err);
    res.status(500).send("Erro no servidor");
  }
});

// Rota para buscar personagens
app.get("/personagenslista", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM personagem");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar personagem:", err);
    res.status(500).send("Erro no servidor");
  }
});

// Rota para adicionar combate
app.post("/combates", async (req, res) => {
  const { wanted_id, personagem_id, resultado, comentario, gravacao } =
    req.body;

  if (!wanted_id || !personagem_id || !resultado) {
    res.status(400).send({ error: "Campos obrigatórios" });
    return;
  }

  const query = `
    INSERT INTO combates (wanted_id, personagem_id, resultado, comentario, gravacao) 
    VALUES ($1, $2, $3, $4, $5)
  `;

  try {
    await pool.query(query, [
      wanted_id,
      personagem_id,
      resultado,
      comentario || null,
      gravacao || null,
    ]);
    res.status(201).send("Combate adicionado com sucesso!");
  } catch (err) {
    console.error("Erro ao adicionar combate", err);
    res.status(500).send("Erro no servidor ao salvar combate");
  }
});

// Rota comentários da match
app.get("/comentarios", async (req, res) => {
  const { wantedId, personagemId } = req.query;

  if (!wantedId || !personagemId) {
    return res
      .status(400)
      .send({ error: "wantedId e personagemId são obrigatórios" });
  }

  const query = `
    SELECT comentario, gravacao, data
    FROM combates
    WHERE wanted_id = $1 AND personagem_id = $2 AND (comentario IS NOT NULL OR gravacao IS NOT NULL)
    ORDER BY data DESC
  `;

  try {
    const { rows } = await pool.query(query, [wantedId, personagemId]);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar comentários:", err);
    res.status(500).send("Erro no servidor");
  }
});


// Rota comentários geral
app.get("/comentarios-wanted", async (req, res) => {
  const { wantedId } = req.query;

  if (!wantedId) {
    return res.status(400).send({ error: "Parâmetro wantedId é obrigatório" });
  }

  const query = `
    SELECT 
      c.comentario,
      c.gravacao,
      p.nome AS personagem_nome,
      c.data
    FROM combates c
    LEFT JOIN personagem p ON c.personagem_id = p.id
    WHERE c.wanted_id = $1 AND (c.comentario IS NOT NULL OR c.gravacao IS NOT NULL)
    ORDER BY c.data DESC
  `;

  try {
    const { rows } = await pool.query(query, [wantedId]);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar comentários do wanted:", err);
    res.status(500).send("Erro no servidor");
  }
});