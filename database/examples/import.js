const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const data = require('./students/students.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importData() {
  const collectionRef = db.collection('students');
  const batch = db.batch();
  let count = 0;

  console.log(`Iniciando importação de ${data.length} documentos para 'instructors'...`);

  data.forEach(doc => {
    // Nota: você precisa garantir que cada objeto 'doc' tenha um campo que você queira usar como ID.
    // Se não, o Firestore gerará um ID automaticamente com .doc().set(doc).
    const docRef = collectionRef.doc(doc.userId); // Se 'userId' for o ID do documento
    batch.set(docRef, doc);
    count++;

    // O limite do batch é 500.
    if (count % 499 === 0) {
      batch.commit();
      console.log(`Commit: ${count} documentos processados.`);
      batch = db.batch(); // Inicia um novo batch
    }
  });

  // Commit final
  await batch.commit();
  console.log(`Importação concluída. Total: ${count} documentos.`);
}

importData().catch(console.error);
