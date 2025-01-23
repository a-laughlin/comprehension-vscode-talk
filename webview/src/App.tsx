import '@radix-ui/themes/styles.css';
import './App.css';
import { DataList, Progress, Theme } from '@radix-ui/themes';
import { useExtensionData } from './hooks/useExtensionData.ts';
import { useLightOrDarkMode } from './hooks/useLightOrDarkMode.ts';

export default function App(){
  const visMode = useLightOrDarkMode();
  const {data} = useExtensionData();

  return (
    <Theme appearance={visMode} accentColor='cyan' asChild>
      <main>
        <p>Commit Summaries:</p>
        {
          data.summary===''
          ? <Progress duration={`3s`} style={{width:'100%',height:'30px'}} />
          : <DataList.Root>
              {data.summary.split('\n')
                .map((line,i)=><DataList.Item key={i}>{line}</DataList.Item>)
              }
            </DataList.Root>
        }
        <p>PR Summaries:</p>
        <DataList.Root>
          {/* {data.prs...} */}
        </DataList.Root>
        <p>Related Issue Summaries:</p>
        <DataList.Root>
          {/* {data.issues...} */}
        </DataList.Root>
      </main>
    </Theme>
  );
}
