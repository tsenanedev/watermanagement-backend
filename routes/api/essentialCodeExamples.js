// SMS Functionality

const smsDetails = `Registamos uma operacao de compra de agua no valor de ${totalPaid.toFixed(2)}. Recarga: ${voucher}. Obrigado pela preferencia.`


let sms = {
    numbers: phoneNumber,
    message: smsDetails
}

fetch('https://lsa.co.mz/mozwater/sendSms.php', {
    method: 'POST',
    body: JSON.stringify(sms),
    headers: { 'Content-Type': 'application/json' }
}).then(res => res.json())
    .then(json => res.send(JSON.stringify({ success: true, message: 'Success' })))
    .catch((err) => res.send(JSON.stringify({ success: false, message: err })))

// FETCH THE LAST INSERTED RECEIPT NUMBER

conn.query("SELECT * FROM customerBalance WHERE id > 100 ORDER BY id DESC LIMIT ?", [1], function (err, rows, field) {
    if (err) {
        res.status(500)
        res.send(JSON.stringify({ success: false, message: err.message }))
    } else if (rows.length > 0) {
        receiptNumber = rows[0].receiptNumber + 1
    } else {
        receiptNumber = 1
    }
})

let sms = {
    numbers: '+' + phoneNumber,
    message: smsDetails
}

fetch('https://lsa.co.mz/mozwater/sendSms.php', {
    method: 'POST',
    body: JSON.stringify(sms),
    headers: { 'Content-Type': 'application/json' }
}).then(res => res.json())
    .then(json => res.send(JSON.stringify({ success: true, message: 'Compra submetida com sucesso!' })))
    .catch((err) => res.send(JSON.stringify({ success: false, message: err })))



conn.query("INSERT INTO users(uid, password, companyId, code, phoneNumber, email, branchId, status, name, userRole, createdAt) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
    [userUid, hash, companyId, code, phoneNumber, email, branchId, status, name, userRole, createdAt], function (err, rows, fields) {
        if (err) {
            res.status(500)
            res.send(JSON.stringify({ success: false, message: err.message }))
        }
        else {
            if (rows.affectedRows > 0) {
                res.send(JSON.stringify({ success: true, message: 'Successfully inserted.' }))
            }
        }
    })


// Firebase Login, Register & Recover Password & SignOut Snips
// import * as firebase from "firebase";
// import "firebase/auth";

function doLogin() {
    this.loading = true;
    firebase
        .auth()
        .signInWithEmailAndPassword(this.email, this.password)
        .then((user) => {
            this.$bvToast.toast("", {
                title: `Login efectuado com sucesso!`,
                variant: "primary",
                solid: true,
            });
            this.loading = false;
            console.log(user);
        })
        .catch((err) => {
            // Handle Errors here.
            var errorCode = err.code;
            var errorMessage = err.message;
            if (errorCode === "auth/wrong-password") {
                this.$bvToast.toast("E-mail ou senha", {
                    title: "Wrong Password.",
                    variant: "danger",
                    solid: true,
                });
            } else {
                this.$bvToast.toast(errorMessage, {
                    title: "",
                    variant: "danger",
                    solid: true,
                });
            }
            this.$bvToast.toast("", {
                title: err.message,
                variant: "danger",
                solid: true,
            });
            this.loading = false;
            this.password = "";
        });
}

function register() {
    this.isLoading = true
    firebase.auth()
        .createUserWithEmailAndPassword(this.email, this.password)
        .then((value) => {
            value
            this.$buefy.notification.open({
                message: 'Cadastro efectuado com sucesso',
                type: 'is-success'
            })
            this.isLoading = false
        })
        .catch((err) => {
            this.$buefy.notification.open({
                message: this.error = err.message,
                type: 'is-danger'
            })
            this.error = err.message
            this.isLoading = false
        })
}

function recover() {
    this.loading = true;
    const email = this.email;
    const auth = firebase.auth();

    auth
        .sendPasswordResetEmail(email)
        .then(() => {
            this.$bvToast.toast(
                "O link de recuperação da senha foi enviado para " + email,
                {
                    title: "",
                    variant: "success",
                    solid: true,
                }
            );
            this.loading = false;
            this.$refs["recover-password"].hide();
        })
        .catch((err) => {
            console.log(err);
            this.$bvToast.toast(err.message, {
                title: "Error",
                variant: "danger",
                solid: true,
            });
            this.loading = false;
            this.$refs["recover-password"].hide();
        });
}

function logout() {
    firebase
        .auth()
        .signOut()
        .then(() => {
            localStorage.removeItem("MatiAppTokenJwt");
            this.$router.replace("/");
        });
}

const config = {
    apiKey: "AIzaSyC1F0mMeAhDrDgr1RsZ-KZrJtRT_QxdzAo",
    authDomain: "mativersaofinal.firebaseapp.com",
    databaseURL: "https://mativersaofinal.firebaseio.com",
    projectId: "mativersaofinal",
    storageBucket: "mativersaofinal.appspot.com",
    messagingSenderId: "202295986130",
    appId: "1:202295986130:web:eeff7571eef872b6076a0b",

    measurementId: "G-XTE3WJE8TD"
}
firebase.initializeApp(config)

firebase.auth().onAuthStateChanged(user => {
    store.commit("updateUser", { user })
})