import { Composition } from "remotion";
import { MyComponent } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="FromChatbotToAIAgent"
        component={MyComponent}
        durationInFrames={1500}
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  );
};
