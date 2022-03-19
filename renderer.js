const testBtn = document.getElementById('btn-test')
const fileOpenBtn = document.getElementById('btn-open-file')
testBtn.addEventListener('click', ()=> {
    const noti = { title: '타이틀 변경', body: '테스트 타이틀!' }
    const myNoti = new window.Notification(noti.title, noti)
    window.electronAPI.setTitle('테스트 타이틀')
})

fileOpenBtn.addEventListener('click', async ()=> {
    const filename = await window.electronAPI.openFile()
    alert(filename)
})

const counter = document.getElementById('counter')
window.electronAPI.handleCounter((event, value)=> {
    const oldVal = Number(counter.innerText)
    const newVal = oldVal + value
    counter.innerText = newVal

    //  electon 공식 예제에서는 event.reply 로 안내하고 있으나 동작 안함
    event.sender.send('counter-value', newVal)
    
})

const dragTest = document.getElementById(`drag-test`)
dragTest.addEventListener('dragstart', e=>{
    e.preventDefault()
    window.electronAPI.dragStart('testIcon.jpg')
})