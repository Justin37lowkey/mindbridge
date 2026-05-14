import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const APP_ID = 'd89c94bf1a4c48708db3f526945fb4f4';

function VideoCall() {
  const { therapistId } = useParams();
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [error, setError] = useState('');

  const clientRef = useRef(null);
  const localTrackRef = useRef({ audio: null, video: null });
  const localVideoRef = useRef(null);

  const channelName = [user?.uid, therapistId].sort().join('_');

  useEffect(() => {
    const join = async () => {
      try {
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        client.on('user-published', async (remoteUser, mediaType) => {
          await client.subscribe(remoteUser, mediaType);
          if (mediaType === 'video') {
            remoteUser.videoTrack.play('remote-video');
          }
          if (mediaType === 'audio') {
            remoteUser.audioTrack.play();
          }
        });

        await client.join(APP_ID, channelName, null, user?.uid);
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        localTrackRef.current = { audio: audioTrack, video: videoTrack };
        videoTrack.play(localVideoRef.current);
        await client.publish([audioTrack, videoTrack]);
        setError('');
        setJoined(true);
      } catch (err) {
        setError('Could not access camera/microphone. Please check permissions.');
        console.error(err);
      }
    };

    join();

    return () => {
      localTrackRef.current.audio?.close();
      localTrackRef.current.video?.close();
      clientRef.current?.leave();
    };
  }, [channelName, user]);

  const toggleMic = () => {
    const audio = localTrackRef.current.audio;
    if (audio) {
      audio.setEnabled(!micOn);
      setMicOn(!micOn);
    }
  };

  const toggleCam = () => {
    const video = localTrackRef.current.video;
    if (video) {
      video.setEnabled(!camOn);
      setCamOn(!camOn);
    }
  };

  const endCall = async () => {
    localTrackRef.current.audio?.close();
    localTrackRef.current.video?.close();
    await clientRef.current?.leave();
    navigate(-1);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerText}>
          <div style={styles.title}>🧠 MindBridge</div>
          <div style={styles.subtitle}>
            {joined ? '🟢 Session Active — Encrypted & Secure' : '⏳ Connecting...'}
          </div>
        </div>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <p style={styles.errorText}>⚠️ {error}</p>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      )}

      <div style={styles.videoGrid}>
        <div style={styles.remoteBox}>
          <div id="remote-video" style={styles.videoPlayer} />
          {!joined && (
            <div style={styles.waitingOverlay}>
              <div style={styles.waitingIcon}>👨‍⚕️</div>
              <div style={styles.waitingText}>Waiting for therapist to join...</div>
            </div>
          )}
          <div style={styles.videoLabel}>Therapist</div>
        </div>

        <div style={styles.localBox}>
          <div ref={localVideoRef} style={styles.videoPlayer} />
          <div style={styles.videoLabel}>You</div>
        </div>
      </div>

      <div style={styles.controls}>
        <button
          style={{...styles.controlBtn, background: micOn ? '#1e3a5f' : '#dc2626'}}
          onClick={toggleMic}
        >
          {micOn ? '🎙️' : '🔇'}
          <span style={styles.btnLabel}>{micOn ? 'Mute' : 'Unmute'}</span>
        </button>

        <button style={styles.endBtn} onClick={endCall}>
          📵
          <span style={styles.btnLabel}>End Call</span>
        </button>

        <button
          style={{...styles.controlBtn, background: camOn ? '#1e3a5f' : '#dc2626'}}
          onClick={toggleCam}
        >
          {camOn ? '📹' : '🚫'}
          <span style={styles.btnLabel}>{camOn ? 'Hide Cam' : 'Show Cam'}</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { height: '100vh', background: '#0a0f1e', display: 'flex', flexDirection: 'column' },
  header: { background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', padding: '16px 24px', display: 'flex', alignItems: 'center' },
  headerText: {},
  title: { color: 'white', fontSize: '18px', fontWeight: 'bold' },
  subtitle: { color: '#94a3b8', fontSize: '12px', marginTop: '2px' },
  errorBox: { background: '#fef2f2', padding: '20px', textAlign: 'center' },
  errorText: { color: '#dc2626', fontSize: '15px' },
  backBtn: { padding: '10px 24px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' },
  videoGrid: { flex: 1, display: 'grid', gridTemplateColumns: '1fr', gridTemplateRows: '1fr 200px', gap: '4px', padding: '8px', overflow: 'hidden' },
  remoteBox: { position: 'relative', background: '#1a2744', borderRadius: '16px', overflow: 'hidden' },
  localBox: { position: 'relative', background: '#1a2744', borderRadius: '12px', overflow: 'hidden' },
  videoPlayer: { width: '100%', height: '100%', background: '#0f172a' },
  waitingOverlay: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#1a2744' },
  waitingIcon: { fontSize: '60px', marginBottom: '16px' },
  waitingText: { color: '#94a3b8', fontSize: '16px', textAlign: 'center' },
  videoLabel: { position: 'absolute', bottom: '10px', left: '12px', color: 'white', fontSize: '12px', background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: '20px' },
  controls: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', padding: '20px', background: '#0f172a' },
  controlBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '14px 20px', border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '24px', color: 'white', minWidth: '80px' },
  endBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '14px 28px', background: '#dc2626', border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '28px', color: 'white', minWidth: '100px' },
  btnLabel: { fontSize: '11px', fontWeight: '600' },
};

export default VideoCall;