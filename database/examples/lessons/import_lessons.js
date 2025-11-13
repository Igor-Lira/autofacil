const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const data = require('./lessons.json'); // Assumindo que o JSON fornecido está em lessons.json

// Inicialize o App
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Função auxiliar para converter strings para tipos de dados do Firestore
function convertToFirestoreTypes(doc) {
  // 1. Converter Strings ISO para Timestamps
  const timestampFields = ['dataHora', 'createdAt', 'updatedAt', 'confirmedAt', 'completedAt'];
  timestampFields.forEach(field => {
    if (doc[field] && typeof doc[field] === 'string') {
      doc[field] = admin.firestore.Timestamp.fromDate(new Date(doc[field]));
    }
  });

  // 2. Converter Coordenadas para GeoPoint
  const coords = doc.localEncontro.coordenadas;
  if (coords && coords._latitude !== undefined && coords._longitude !== undefined) {
    doc.localEncontro.coordenadas = new admin.firestore.GeoPoint(coords._latitude, coords._longitude);
  }

  // Nota: O campo 'pontosGPS' no 'tracking' deve ser tratado separadamente se for uma subcoleção.
  // Para importação em lote simples, mantemos como array.

  return doc;
}


async function importData() {
  const collectionName = 'lessons'; // Nome da coleção: aulas -> lessons
  const collectionRef = db.collection(collectionName);
  let batch = db.batch();
  let count = 0;

  console.log(`\nIniciando importação de ${data.length} documentos para '${collectionName}'...`);

  data.forEach(rawDoc => {
    // --- CORREÇÃO AQUI: Usar 'aulaId' como o ID do documento ---
    const docId = rawDoc.aulaId;

    if (!docId) {
      console.error("ERRO DE DADO: Documento sem 'aulaId'. Pulando registro.");
      return;
    }

    // 3. Converter Tipos antes de enviar ao Firestore
    const firestoreDoc = convertToFirestoreTypes(rawDoc);

    const docRef = collectionRef.doc(docId);
    batch.set(docRef, firestoreDoc);
    count++;

    // O limite do batch é 500.
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
