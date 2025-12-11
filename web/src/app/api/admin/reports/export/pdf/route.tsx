import {
  Document,
  Page,
  StyleSheet,
  Text,
  renderToStream,
} from "@react-pdf/renderer";
import { NextResponse } from "next/server";


async function getReportData() {
  return {
    title: "SolveIt Report",
    generatedAt: new Date().toLocaleString(),
  };
}

export async function GET() {
  const data = await getReportData();

  const styles = StyleSheet.create({
    page: { padding: 20 },
    title: { fontSize: 22, marginBottom: 10 },
    text: { fontSize: 14, marginBottom: 5 },
  });

  const Report = () => (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.text}>Generated At: {data.generatedAt}</Text>
        <Text style={styles.text}>More content will go here...</Text>
      </Page>
    </Document>
  );

  const pdfStream = await renderToStream(<Report />);

  return new NextResponse(pdfStream as unknown as ReadableStream );
}
