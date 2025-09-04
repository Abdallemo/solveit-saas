import { VideoCallModal } from "@/features/mentore/components/workspace/VideoCallModal";
import { VideoCallPageComps } from "@/features/mentore/components/workspace/VideoCallpageComps";

export default function page() {
  return (
    <VideoCallModal>
      <VideoCallPageComps />
    </VideoCallModal>
  );
}
