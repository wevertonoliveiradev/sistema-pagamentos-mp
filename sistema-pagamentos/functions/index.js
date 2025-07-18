// functions/index.js - Versão Corrigida
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

admin.initializeApp();
const db = admin.firestore();

const client = new MercadoPagoConfig({
  accessToken: functions.config().mercadopago.token,
});

exports.createPaymentPreference = functions
  .region("southamerica-east1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Ação permitida apenas para usuários autenticados.');
    }
    const { clientId, value, description, liveDate } = data;
    if (!clientId || !value || !description || !liveDate) {
      throw new functions.https.HttpsError('invalid-argument', 'Todos os campos são obrigatórios.');
    }
    try {
      const clientDoc = await db.collection('clients').doc(clientId).get();
      if (!clientDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Cliente não encontrado.');
      }
      const clientData = clientDoc.data();
      if (clientData.userId !== context.auth.uid) {
         throw new functions.https.HttpsError('permission-denied', 'Você não tem permissão para usar este cliente.');
      }
      const paymentId = db.collection("payments").doc().id;
      const preferenceBody = {
        items: [{ title: description, quantity: 1, currency_id: "BRL", unit_price: Number(value) }],
        payer: { name: clientData.name },
        external_reference: paymentId,
        notification_url: `https://southamerica-east1-projeto-pagamentos-mp.cloudfunctions.net/mercadoPagoWebhook`,
        back_urls: { success: "https://seusite.com/sucesso", failure: "https://seusite.com/falha", pending: "https://seusite.com/pendente" },
        auto_return: "approved",
      };
      const preference = new Preference(client);
      const result = await preference.create({ body: preferenceBody });
      const paymentLink = result.init_point;
      await db.collection("payments").doc(paymentId).set({
        id: paymentId,
        value: Number(value),
        description: description,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        paymentLink: paymentLink,
        clientId: clientId,
        clientName: clientData.name,
        clientName_lowercase: clientData.name.toLowerCase(),
        whatsapp: clientData.whatsapp,
        instagram: clientData.instagram,
        liveDate: liveDate,
        userId: context.auth.uid,
      });
      return { init_point: paymentLink };
    } catch (error) {
      console.error("Erro detalhado ao criar preferência:", error);
      if (error instanceof functions.https.HttpsError) throw error;
      throw new functions.https.HttpsError("internal", "Falha interna ao criar a preferência de pagamento.");
    }
  });

exports.mercadoPagoWebhook = functions
  .region("southamerica-east1")
  .https.onRequest(async (req, res) => {
    const notification = req.body;
    if (notification.type === 'payment' && notification.data && notification.data.id) {
      try {
        const payment = new Payment(client);
        const paymentInfo = await payment.get({ id: notification.data.id });
        if (paymentInfo && paymentInfo.external_reference) {
          const ourPaymentId = paymentInfo.external_reference;
          await db.collection('payments').doc(ourPaymentId).update({
            status: paymentInfo.status,
            mercadoPagoData: paymentInfo,
          });
        }
      } catch (error) {
        console.error('Erro ao processar webhook:', error);
        return res.status(500).send('Erro ao processar webhook');
      }
    }
    res.status(200).send('Webhook recebido');
  });