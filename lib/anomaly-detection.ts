import { KMeans } from 'ml-kmeans';

interface VotingPattern {
  timestamp: number;
  location: string;
  deviceId: string;
  verificationAttempts: number;
  voterIds: string[];
}

interface AnomalyResult {
  cluster: number;
  anomalyScore: number;
  patterns: VotingPattern[];
  description: string;
}

export function detectAnomalies(patterns: VotingPattern[], numClusters = 3): AnomalyResult[] {
  // Prepare data for clustering
  const features = patterns.map(pattern => [
    pattern.timestamp,
    pattern.verificationAttempts,
    pattern.voterIds.length
  ]);

  // Normalize features
  const normalizedFeatures = normalizeFeatures(features);

  // Perform k-means clustering
  const { clusters, centroids } = KMeans(normalizedFeatures, numClusters);

  // Calculate anomaly scores based on distance from cluster centroids
  const anomalyResults: AnomalyResult[] = patterns.map((pattern, index) => {
    const cluster = clusters[index];
    const distanceToCentroid = calculateDistance(
      normalizedFeatures[index],
      centroids[cluster]
    );

    return {
      cluster,
      anomalyScore: distanceToCentroid,
      patterns: [pattern],
      description: generateAnomalyDescription(pattern, distanceToCentroid)
    };
  });

  // Group patterns by cluster and sort by anomaly score
  const groupedResults = groupByCluster(anomalyResults);
  return groupedResults.filter(result => result.anomalyScore > 0.7);
}

function normalizeFeatures(features: number[][]): number[][] {
  const numFeatures = features[0].length;
  const mins = new Array(numFeatures).fill(Infinity);
  const maxs = new Array(numFeatures).fill(-Infinity);

  // Find min and max for each feature
  features.forEach(sample => {
    sample.forEach((value, i) => {
      mins[i] = Math.min(mins[i], value);
      maxs[i] = Math.max(maxs[i], value);
    });
  });

  // Normalize features to [0, 1] range
  return features.map(sample =>
    sample.map((value, i) => (value - mins[i]) / (maxs[i] - mins[i]))
  );
}

function calculateDistance(point1: number[], point2: number[]): number {
  return Math.sqrt(
    point1.reduce((sum, value, i) => sum + Math.pow(value - point2[i], 2), 0)
  );
}

function generateAnomalyDescription(
  pattern: VotingPattern,
  anomalyScore: number
): string {
  const descriptions = [];

  if (pattern.verificationAttempts > 5) {
    descriptions.push(`High number of verification attempts (${pattern.verificationAttempts})`);
  }

  if (pattern.voterIds.length > 3) {
    descriptions.push(`Multiple voter IDs used (${pattern.voterIds.length})`);
  }

  if (anomalyScore > 0.9) {
    descriptions.push('Highly unusual pattern detected');
  } else if (anomalyScore > 0.7) {
    descriptions.push('Moderately suspicious pattern');
  }

  return descriptions.join('. ');
}

function groupByCluster(results: AnomalyResult[]): AnomalyResult[] {
  const grouped = new Map<number, AnomalyResult>();

  results.forEach(result => {
    if (!grouped.has(result.cluster)) {
      grouped.set(result.cluster, {
        cluster: result.cluster,
        anomalyScore: result.anomalyScore,
        patterns: [],
        description: result.description
      });
    }

    const group = grouped.get(result.cluster)!;
    group.patterns.push(...result.patterns);
    group.anomalyScore = Math.max(group.anomalyScore, result.anomalyScore);
  });

  return Array.from(grouped.values());
}