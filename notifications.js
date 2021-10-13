

async function checkNotifcationPermission() {
    Notification.requestPermission().then(permission => {
        console.log(permission)
    });

    console.log (Notification.permission);
if (Notification.permission === "granted"){
    showNotification();
} else if (Notification.permission !== "denied"){
    Notification.requestPermission().then(permission => {
        console.log(permission)
    });
}
}

async function showNotification() {
    notification = new Notification("New Message", {
        body: "Sup?",
        img: "/favicon.ico"
    });
}