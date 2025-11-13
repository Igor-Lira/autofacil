const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
// Certifique-se de que este caminho está correto
const data = require('./payments.json');

// Inicialize o App se ainda não estiver inicializado (se for um script standalone)
// Se você está reutilizando o ambiente, pode pular esta parte se já estiver inicializado.
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (e) {
  // Evita erro se o app já estiver inicializado
  if (!e.message.includes('already exists')) {
    console.error("Erro ao inicializar o app:", e);
    process.exit(1);
  }
}

const db = admin.firestore();

// Função auxiliar para converter strings de data/hora em Timestamps do Firestore
function convertToFirestoreTypes(doc) {
  // Campos que devem ser convertidos para Timestamp
  const timestampFields = ['createdAt', 'updatedAt', 'processedAt', 'reembolso.dataHora'];

  timestampFields.forEach(fieldPath => {
    let current = doc;
    // Navega por campos aninhados (ex: reembolso.dataHora)
    const parts = fieldPath.split('.');

    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) return;
      current = current[parts[i]];
    }

    const lastPart = parts[parts.length - 1];

    if (current && current[lastPart] && typeof current[lastPart] === 'string') {
      current[lastPart] = admin.firestore.Timestamp.fromDate(new Date(current[lastPart]));
    }
  });

  return doc;
}


async function importData() {
  const collectionName = 'payments'; // Coleção de destino
  const collectionRef = db.collection(collectionName);
  let batch = db.batch();
  let count = 0;

  console.log(`\nIniciando importação de ${data.length} documentos para '${collectionName}'...`);

  data.forEach(rawDoc => {
    // --- CHAVE DE CORREÇÃO: Usar 'pagamentoId' como o ID do documento ---
    const docId = rawDoc.pagamentoId;

    if (!docId) {
      console.error("ERRO DE DADO: Documento de pagamento sem 'pagamentoId'. Pulando registro.");
      return;
    }

    // Converte os tipos de dados
    const firestoreDoc = convertToFirestoreTypes(rawDoc);

    const docRef = collectionRef.doc(docId);
    batch.set(docRef, firestoreDoc);
    count++;

    // Limite do Batch: 500 operações
    if (count % 499 === 0) {
      batch.commit();
      console.log(`Commit intermediário: ${count} documentos processados.`);
      batch = db.batch(); // Inicia um novo batch
    }
  });

  // Commit final
  await batch.commit();
  console.log(`\nImportação concluída. Total: ${count} documentos importados para '${collectionName}'.`);
}

importData().catch(error => {
  console.error("\n--- ERRO CRÍTICO DURANTE A IMPORTAÇÃO ---");
  console.error(error);
});
