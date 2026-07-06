import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2', fontWeight: 700 }
  ]
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Inter', backgroundColor: '#ffffff' },
  header: { marginBottom: 20, borderBottom: '1px solid #e5e7eb', paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#6b7280' },
  section: { marginTop: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8, backgroundColor: '#f3f4f6', padding: 4 },
  text: { fontSize: 10, color: '#374151', lineHeight: 1.5, marginBottom: 8 },
  scoreCard: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, backgroundColor: '#f9fafb', padding: 15, borderRadius: 4 },
  companyBox: { flex: 1, padding: 10 },
  companyName: { fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 },
  score: { fontSize: 20, fontWeight: 700, color: '#4f46e5' },
  verdict: { fontSize: 10, color: '#059669', fontWeight: 700, marginTop: 4 },
  winnerBadge: { backgroundColor: '#4f46e5', color: 'white', padding: '4 8', borderRadius: 12, fontSize: 10, alignSelf: 'flex-start', marginTop: 10 }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ComparisonPDF = ({ reportA, reportB, comparison }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Company Comparison</Text>
        <Text style={styles.subtitle}>{reportA.companyName} vs {reportB.companyName}</Text>
      </View>

      <View style={styles.scoreCard}>
        <View style={styles.companyBox}>
          <Text style={styles.companyName}>{reportA.companyName}</Text>
          <Text style={styles.score}>{reportA.score}/100</Text>
          <Text style={styles.verdict}>{reportA.verdict}</Text>
        </View>
        <View style={styles.companyBox}>
          <Text style={styles.companyName}>{reportB.companyName}</Text>
          <Text style={styles.score}>{reportB.score}/100</Text>
          <Text style={styles.verdict}>{reportB.verdict}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Winner</Text>
        <Text style={styles.winnerBadge}>{comparison.finalWinner} ({comparison.confidenceScore}% Confidence)</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Executive Comparison</Text>
        <Text style={styles.text}>{comparison.executiveComparison}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Strengths Comparison</Text>
        <Text style={styles.text}>{comparison.strengthsComparison}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weaknesses Comparison</Text>
        <Text style={styles.text}>{comparison.weaknessesComparison}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Market Comparison</Text>
        <Text style={styles.text}>{comparison.marketComparison}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Competitive Advantage</Text>
        <Text style={styles.text}>{comparison.competitiveAdvantage}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Risk Comparison</Text>
        <Text style={styles.text}>{comparison.riskComparison}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Investment Recommendation</Text>
        <Text style={styles.text}>{comparison.investmentRecommendation}</Text>
      </View>
    </Page>
  </Document>
);
