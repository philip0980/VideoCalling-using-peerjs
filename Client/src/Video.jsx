import React, { useEffect, useRef, useState } from "react";
import { Peer } from "peerjs";
import { io } from "socket.io-client";

const Video = () => {
  const [peerId, setPeerId] = useState("");
  const [oppPeerId, setOppPeerId] = useState("");
  const [localStream, setLocalStream] = useState("");
  const [remoteStream, setRemoteStream] = useState("");
  const peerRef = useRef(null);
  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:8000");

    socketRef.current.on("connect", () => {
      console.log("Connected to socket io server");
    });

    socketRef.current.on("newPeer", (id) => {
      setOppPeerId(id);
      console.log("New peer connected", id);
    });
  }, []);

  useEffect(() => {
    const peer = new Peer();
    peerRef.current = peer;

    peer.on("open", (id) => {
      setPeerId(id);
      const socket = socketRef.current;
      socket.emit("sendId", { id });
    });

    peer.on("call", (call) => {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        setLocalStream(stream);
        call.answer(stream);

        call.on("stream", (remoteStream) => {
          setRemoteStream(remoteStream);
        });
      });
    });
  }, [localStream]);

  const handleOpenVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setLocalStream(stream);
      localVideoRef.current.srcObject = stream;
    } catch (error) {
      console.log("Error opening video", error);
    }
  };

  const handleScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      setLocalStream(screenStream);

      localVideoRef.current.srcObject = screenStream;

      const peer = peerRef.current;
      if (oppPeerId && localStream) {
        const call = peer.call(oppPeerId, localStream);
        call.on("stream", (remoteStream) => {
          setRemoteStream(remoteStream);
        });
      } else {
        console.log("Please input opponent peer id or initialize local stream");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCall = () => {
    const peer = peerRef.current;
    if (oppPeerId && localStream) {
      const call = peer.call(oppPeerId, localStream);

      call.on("stream", (remoteStream) => {
        setRemoteStream(remoteStream);
      });
    } else {
      console.log("Please input opponent peer id or initialize localstream");
    }
  };

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div>
      <input
        type="text"
        value={oppPeerId}
        placeholder="Input opponent Peer Id"
        onChange={(e) => setOppPeerId(e.target.value)}
      />
      <button onClick={() => handleOpenVideo()}>Open video</button>
      <button onClick={() => handleScreenShare()}>Share Screen</button>
      <button onClick={() => handleCall()}>Call</button>

      <div className="videoes">
        <p>My video</p>
        <video ref={localVideoRef} autoPlay muted style={{ width: " 300px" }} />
        <p>Opponent video</p>
        <video
          ref={remoteVideoRef}
          autoPlay
          muted
          style={{ width: " 300px" }}
        />
        <p>The peer id is : {peerId}</p>
      </div>
    </div>
  );
};

export default Video;
