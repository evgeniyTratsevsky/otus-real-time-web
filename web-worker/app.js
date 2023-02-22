const worker = new Worker("worker.js");

if (window.Notification && Notification.permission !== "denied") {
  Notification.requestPermission((status) => {
    // status is "granted", if accepted by user
    if (status === 'granted') {
      const n = new Notification('OTUS', {
        body: 'Первое уведомление',
        // icon: '/path/to/icon.png' // optional
      })
      setTimeout(n.close(), 1 * 1000)
    }
  })
}

document.querySelector('.js-start').addEventListener('click', () => {
  worker.postMessage({ type: 'start' })
})

document.querySelector('.js-stop').addEventListener('click', () => {
  worker.postMessage({ type: 'stop' })
})

let notification
worker.addEventListener('message', (event) => {
  if (event.data.type === 'message') {
    const message = event.data.payload
    console.log(message)

    // закрываем предыдущее уведомление
    if (notification) {
      notification.close()
    }

    notification = new Notification(message)
  }
})
