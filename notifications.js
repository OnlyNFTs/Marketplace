

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
    var img = '/to-do-notifications/img/icon-128.png';
    var text = 'HEY! Your task "' + title + '" is now overdue.';
    var notification = new Notification('To do list', { body: text, icon: img });
}