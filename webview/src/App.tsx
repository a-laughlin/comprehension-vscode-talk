import '@radix-ui/themes/styles.css';
import './App.css';
import { DataList, Progress, Theme } from '@radix-ui/themes';
import { useMessageToWebview } from './hooks/useMessageToWebview.ts';
import { useLightOrDarkMode } from './hooks/useLightOrDarkMode.ts';

export default function App(){
  const visMode = useLightOrDarkMode();
  const {data} = useMessageToWebview();

  return (
    <Theme appearance={visMode} accentColor='cyan' asChild>
      <main>
        {
          data.commitSummaries===''
            ? <div style={{width:'100%',height:'1em', padding:'1em'}}>
                <Progress duration={`3s`} style={{width:'100%'}} />
              </div>
            : <>
                <p>Commit Summaries:</p>
                <DataList.Root>
                  {data.commitSummaries.split('\n')
                    .map((line,i)=><DataList.Item key={i}>{line}</DataList.Item>)
                  }
                </DataList.Root>
                <p>PR Summaries:</p>
                <DataList.Root>
                  {data.prSummaries.split('\n')
                    .map((line,i)=><DataList.Item key={i}>{line}</DataList.Item>)
                  }
                </DataList.Root>
              </>
        }
      </main>
    </Theme>
  );
}
