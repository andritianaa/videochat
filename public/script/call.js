const socket = io('https://video.teratany.org')
const localVideo = document.getElementById('localVideo')
const remoteVideo = document.getElementById('remoteVideo')
const statusDiv = document.getElementById('status')
const callName = new URLSearchParams(window.location.search).get('call')
if (!callName) window.location.href = "index.html"

let peer
let model
// Initialiser le modèle BodyPix
const bodyPixConfig = {
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 1,
    quantBytes: 2
}

const loadBodyPixModel = async () => model = await bodyPix.load(bodyPixConfig)

// Flouter l'arrière-plan
const blurBackground = async (video, canvas) => {
    const segmentation = await model.segmentPerson(video)
    const backgroundBlurAmount = 6
    bodyPix.drawBokehEffect(canvas, video, segmentation, backgroundBlurAmount, 5)
}


navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localVideo.srcObject = stream
        socket.emit('join', callName)
        socket.on('other-user', otherUserId => {
            peer = new SimplePeer({ initiator: true, trickle: false, stream })
            peer.on('signal', signal => socket.emit('offer', signal))
            peer.on('stream', stream => {
                remoteVideo.srcObject = stream
                statusDiv.textContent = ''
            })
            socket.on('answer', answer => peer.signal(answer))
        })

        socket.on('offer', offer => {
            peer = new SimplePeer({ initiator: false, trickle: false, stream })
            peer.on('signal', signal => socket.emit('answer', signal))
            peer.on('stream', stream => {
                remoteVideo.srcObject = stream
                statusDiv.textContent = ''
            })
            peer.signal(offer)
        })

        socket.on('user-disconnected', () => statusDiv.textContent = 'Your friend has left the call.')
        loadBodyPixModel()
    })
    .catch(error => { console.error('Error accessing media devices: ', error) })