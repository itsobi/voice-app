import { PageHeader } from '@/components/page-header';
import VoiceNote from '@/components/voice-note';
import { cn } from '@/lib/utils';

export default function TwentySomethingsTopic() {
  return (
    <div>
      <PageHeader
        header="👨‍🎓 Twenty-somethings"
        description="Your twenties are an interesting time. Chime in on the conversation!"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <VoiceNote />
      </div>
    </div>
  );
}
