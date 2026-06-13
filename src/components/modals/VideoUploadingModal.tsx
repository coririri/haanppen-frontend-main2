import ReactModal from 'react-modal';
import './css/LoadingTtitleAnimation.css';
import { LoadingType } from '../../types/loadingType';

interface VideoUploadingModalProps {
  modalOpen: boolean;
  uploadingInfoList: LoadingType[];
}

function VideoUploadingModal({
  modalOpen,
  uploadingInfoList,
}: VideoUploadingModalProps) {
  const customModalStyles: ReactModal.Styles = {
    overlay: {
      backgroundColor: ' rgba(0, 0, 0, 0.4)',
      width: '100%',
      height: '100vh',
      zIndex: '10',
      position: 'fixed',
      top: '0',
      left: '0',
    },
    content: {
      width: '480px',
      maxHeight: '70vh',
      zIndex: '150',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      borderRadius: '20px',
      boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.25)',
      backgroundColor: 'white',
      overflow: 'auto',
    },
  };

  return (
    <ReactModal isOpen={modalOpen} style={customModalStyles}>
      <div className="p-8">
        <h1 className="font-bold text-xl text-center text-[#151B26] mb-6 flicker">
          Uploading....
        </h1>
        <div className="flex flex-col gap-5">
          {uploadingInfoList.map((item) => (
            <div key={item.fileName} className="flex flex-col gap-1">
              <span className="text-sm font-bold truncate max-w-[380px]">
                {item.fileName}
              </span>
              <div
                aria-hidden="true"
                className="w-full h-[12px] bg-[#e5eaef] rounded-xl relative overflow-hidden"
              >
                <span
                  className="block absolute top-0 left-0 h-[12px] rounded-xl bg-[#13CE66] transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      Math.round(((item.current + 1) / item.end) * 100),
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ReactModal>
  );
}

export default VideoUploadingModal;
