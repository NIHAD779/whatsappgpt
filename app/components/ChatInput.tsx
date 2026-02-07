"use client";

import { useState, KeyboardEvent, useRef, ChangeEvent } from "react";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";

interface ChatInputProps {
  onSend: (message: string) => void;
  onVoiceSend: (audioBlob: Blob, duration: number) => void;
  onImageSend: (imageFile: File, caption?: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, onVoiceSend, onImageSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [imageCaption, setImageCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    error: recorderError,
  } = useVoiceRecorder();

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicPress = async () => {
    if (!isRecording) {
      await startRecording();
    }
  };

  const handleMicRelease = async () => {
    if (isRecording) {
      const audioBlob = await stopRecording();
      if (audioBlob) {
        onVoiceSend(audioBlob, recordingDuration);
      }
    }
  };

  const handleMicCancel = () => {
    if (isRecording) {
      cancelRecording();
    }
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviewUrl(reader.result as string);
        setShowImagePreview(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSendClick = () => {
    if (selectedImage) {
      onImageSend(selectedImage, imageCaption.trim() || undefined);
      setShowImagePreview(false);
      setSelectedImage(null);
      setImagePreviewUrl("");
      setImageCaption("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImageCancel = () => {
    setShowImagePreview(false);
    setSelectedImage(null);
    setImagePreviewUrl("");
    setImageCaption("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Image Preview Modal */}
      {showImagePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="w-full max-w-md p-4">
            <div className="flex flex-col gap-3">
              {/* Close Button */}
              <button
                onClick={handleImageCancel}
                className="self-end flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Image Preview */}
              <img
                src={imagePreviewUrl}
                alt="Preview"
                className="max-h-[60vh] w-full rounded-lg object-contain"
              />

              {/* Caption Input */}
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="Add a caption..."
                className="w-full rounded-full bg-white/10 px-4 py-3 text-white placeholder-white/50 outline-none backdrop-blur-sm"
              />

              {/* Send Button */}
              <button
                onClick={handleImageSendClick}
                className="flex items-center justify-center gap-2 rounded-full bg-[var(--wa-teal)] px-6 py-3 font-medium text-white transition-transform active:scale-95"
              >
                <span>Send</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="fixed left-0 right-0 bottom-16 z-40 mx-auto flex w-full max-w-md items-center justify-center gap-3 rounded-t-lg bg-[var(--wa-bubble-sent)] px-4 py-3 shadow-lg">
          <div className="recording-dot h-3 w-3 rounded-full bg-red-500"></div>
          <span className="text-sm font-medium text-[var(--wa-text-primary)]">
            Recording... {formatRecordingTime(recordingDuration)}
          </span>
          <button
            onClick={handleMicCancel}
            className="ml-auto text-sm text-[var(--wa-text-secondary)] hover:text-[var(--wa-text-primary)]"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--wa-input-bg)] px-2 py-1.5 shadow-[0_-1px_2px_rgba(0,0,0,0.1)]">
        <div className="flex items-end gap-2">
          {/* Emoji Button */}
          <button
            disabled={disabled}
            className="mb-1.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[var(--wa-text-secondary)] transition-colors hover:bg-black/5 active:bg-black/10 disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              width="26"
              height="26"
              fill="currentColor"
            >
              <path d="M9.153 11.603c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962zm-3.204 1.362c-.026-.307-.131 5.218 6.063 5.551 6.066-.25 6.066-5.551 6.066-5.551-6.078 1.416-12.129 0-12.129 0zm11.363 1.108s-.669 1.959-5.051 1.959c-3.505 0-5.388-1.164-5.607-1.959 0 0 5.912 1.055 10.658 0zM11.804 1.011C5.609 1.011.978 6.033.978 12.228s4.826 10.761 11.021 10.761S23.02 18.423 23.02 12.228c.001-6.195-5.021-11.217-11.216-11.217zM12 21.354c-5.273 0-9.381-3.886-9.381-9.159s3.942-9.548 9.215-9.548 9.548 4.275 9.548 9.548c-.001 5.272-4.109 9.159-9.382 9.159zm3.108-9.751c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962z" />
            </svg>
          </button>

          {/* Input Field Container */}
          <div className="flex flex-1 items-center gap-2 rounded-3xl bg-white px-3 py-2 shadow-sm">
            {/* Attachment Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="flex-shrink-0 text-[var(--wa-text-secondary)] transition-colors hover:text-[var(--wa-text-primary)] disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M1.816 15.556v.002c0 1.502.584 2.912 1.646 3.972s2.472 1.647 3.974 1.647a5.58 5.58 0 0 0 3.972-1.645l9.547-9.548c.769-.768 1.147-1.767 1.058-2.817-.079-.968-.548-1.927-1.319-2.698-1.594-1.592-4.068-1.711-5.517-.262l-7.916 7.915c-.881.881-.792 2.25.214 3.261.959.958 2.423 1.053 3.263.215l5.511-5.512c.28-.28.267-.722.053-.936l-.244-.244c-.191-.191-.567-.349-.957.04l-5.506 5.506c-.18.18-.635.127-.976-.214-.098-.097-.576-.613-.213-.973l7.915-7.917c.818-.817 2.267-.699 3.23.262.5.501.802 1.1.849 1.685.051.573-.156 1.111-.589 1.543l-9.547 9.549a3.97 3.97 0 0 1-2.829 1.171 3.975 3.975 0 0 1-2.83-1.173 3.973 3.973 0 0 1-1.172-2.828c0-1.071.415-2.076 1.172-2.83l7.209-7.211c.157-.157.264-.579.028-.814L11.5 4.36a.572.572 0 0 0-.834.018l-7.205 7.207a5.577 5.577 0 0 0-1.645 3.971z" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Text Input */}
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message"
              disabled={disabled}
              className="flex-1 bg-transparent text-[15px] text-[var(--wa-text-primary)] placeholder-[var(--wa-text-muted)] outline-none disabled:opacity-50"
            />
          </div>

          {/* Mic or Send Button */}
          {message.trim() ? (
            <button
              onClick={handleSend}
              disabled={disabled}
              className="mb-1.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--wa-teal)] text-white shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="currentColor"
              >
                <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z" />
              </svg>
            </button>
          ) : (
            <button
              onMouseDown={handleMicPress}
              onMouseUp={handleMicRelease}
              onMouseLeave={handleMicCancel}
              onTouchStart={handleMicPress}
              onTouchEnd={handleMicRelease}
              disabled={disabled}
              className={`mb-1.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full shadow-md transition-all disabled:opacity-50 ${
                isRecording
                  ? 'bg-red-500 scale-110'
                  : 'bg-[var(--wa-teal)] active:scale-95'
              } text-white`}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.469 2.35 8.469 4.35v7.061c0 2.001 1.53 3.531 3.53 3.531zm6.238-3.53c0 3.531-2.942 6.002-6.237 6.002s-6.237-2.471-6.237-6.002H3.761c0 4.001 3.178 7.297 7.061 7.885v3.884h2.354v-3.884c3.884-.588 7.061-3.884 7.061-7.885h-2z" />
              </svg>
            </button>
          )}
        </div>
        {recorderError && (
          <p className="mt-1 text-xs text-red-500 px-2">{recorderError}</p>
        )}
      </div>
    </>
  );
}
