import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Trophy, Award, Target, TrendingUp, Star } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const COLORS = {
  primary: '#3498db',
  success: '#2ecc71',
  danger: '#e74c3c',
  warning: '#f39c12',
  gray: '#95a5a6',
  lightGray: '#ecf0f1',
  white: '#ffffff',
  background: '#f8f9fa',
  text: '#2c3e50',
  textLight: '#7f8c8d',
  gold: '#ffd700',
  silver: '#c0c0c0',
  bronze: '#cd7f32',
};

// Mock gamification data - would come from backend in real app
const mockBadges = [
  {
    id: '1',
    name: 'First Payment',
    description: 'Record your first debt payment',
    earnedAt: '2024-01-15T10:00:00Z',
    icon: 'star',
    category: 'milestone',
    rarity: 'bronze',
  },
  {
    id: '2',
    name: 'Consistent Payer',
    description: 'Make payments 3 months in a row',
    earnedAt: '2024-02-01T10:00:00Z',
    icon: 'target',
    category: 'consistency',
    rarity: 'silver',
  },
  {
    id: '3',
    name: 'Debt Eliminator',
    description: 'Pay off your first debt completely',
    earnedAt: null,
    icon: 'trophy',
    category: 'achievement',
    rarity: 'gold',
  },
  {
    id: '4',
    name: 'Budget Master',
    description: 'Stay under budget for 2 months',
    earnedAt: null,
    icon: 'award',
    category: 'budget',
    rarity: 'silver',
  },
  {
    id: '5',
    name: 'Snowball Champion',
    description: 'Pay off 3 debts using snowball method',
    earnedAt: null,
    icon: 'trending-up',
    category: 'strategy',
    rarity: 'gold',
  },
];

const mockMilestones = [
  {
    id: '1',
    description: 'Make 10 debt payments',
    target: 10,
    current: 7,
    achieved: false,
    type: 'payment_count',
  },
  {
    id: '2',
    description: 'Pay off $5,000 in debt',
    target: 5000,
    current: 3250,
    achieved: false,
    type: 'money_saved',
  },
  {
    id: '3',
    description: 'Pay off 1 debt completely',
    target: 1,
    current: 0,
    achieved: false,
    type: 'debt_paid',
  },
  {
    id: '4',
    description: 'Make payments for 6 consecutive months',
    target: 6,
    current: 3,
    achieved: false,
    type: 'consistency',
  },
];

export default function GamificationScreen() {
  const { list: debts } = useSelector((state: RootState) => state.debts);
  
  // Mock calculations - would come from backend
  const totalPointsEarned = 2750;
  const currentLevel = Math.floor(totalPointsEarned / 1000) + 1;
  const pointsForNextLevel = (currentLevel * 1000) - totalPointsEarned;
  const levelProgress = ((totalPointsEarned % 1000) / 1000) * 100;

  const earnedBadges = mockBadges.filter(badge => badge.earnedAt);
  const availableBadges = mockBadges.filter(badge => !badge.earnedAt);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'star':
        return <Star size={24} color={COLORS.white} />;
      case 'target':
        return <Target size={24} color={COLORS.white} />;
      case 'trophy':
        return <Trophy size={24} color={COLORS.white} />;
      case 'award':
        return <Award size={24} color={COLORS.white} />;
      case 'trending-up':
        return <TrendingUp size={24} color={COLORS.white} />;
      default:
        return <Star size={24} color={COLORS.white} />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'gold':
        return COLORS.gold;
      case 'silver':
        return COLORS.silver;
      case 'bronze':
        return COLORS.bronze;
      default:
        return COLORS.gray;
    }
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'payment_count':
        return <Target size={20} color={COLORS.primary} />;
      case 'money_saved':
        return <TrendingUp size={20} color={COLORS.success} />;
      case 'debt_paid':
        return <Trophy size={20} color={COLORS.warning} />;
      case 'consistency':
        return <Award size={20} color={COLORS.primary} />;
      default:
        return <Star size={20} color={COLORS.primary} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Your Progress</Text>
          <Text style={styles.headerSubtitle}>
            Level {currentLevel} • {totalPointsEarned.toLocaleString()} points
          </Text>
        </View>
        <Trophy size={32} color={COLORS.warning} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Level Progress */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelTitle}>Level {currentLevel}</Text>
            <Text style={styles.levelSubtitle}>
              {pointsForNextLevel} points to Level {currentLevel + 1}
            </Text>
          </View>
          
          <View style={styles.levelProgressContainer}>
            <View style={styles.levelProgressBar}>
              <View 
                style={[
                  styles.levelProgressFill, 
                  { width: `${levelProgress}%` }
                ]} 
              />
            </View>
            <Text style={styles.levelProgressText}>
              {levelProgress.toFixed(0)}% to next level
            </Text>
          </View>

          <View style={styles.levelRewards}>
            <Text style={styles.rewardsTitle}>Level Rewards</Text>
            <Text style={styles.rewardsText}>
              • Unlock advanced debt strategies
            </Text>
            <Text style={styles.rewardsText}>
              • Access to premium analytics
            </Text>
            <Text style={styles.rewardsText}>
              • Custom badge collection
            </Text>
          </View>
        </View>

        {/* Earned Badges */}
        <View style={styles.badgeSection}>
          <Text style={styles.sectionTitle}>
            Earned Badges ({earnedBadges.length})
          </Text>
          <View style={styles.badgeGrid}>
            {earnedBadges.map((badge) => (
              <View key={badge.id} style={styles.badgeCard}>
                <View 
                  style={[
                    styles.badgeIcon,
                    { backgroundColor: getRarityColor(badge.rarity) }
                  ]}
                >
                  {getBadgeIcon(badge.icon)}
                </View>
                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.badgeDescription}>{badge.description}</Text>
                <Text style={styles.badgeEarned}>
                  Earned {new Date(badge.earnedAt!).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Available Badges */}
        <View style={styles.badgeSection}>
          <Text style={styles.sectionTitle}>
            Available Badges ({availableBadges.length})
          </Text>
          <View style={styles.badgeGrid}>
            {availableBadges.map((badge) => (
              <View key={badge.id} style={[styles.badgeCard, styles.lockedBadge]}>
                <View style={[styles.badgeIcon, styles.lockedBadgeIcon]}>
                  {getBadgeIcon(badge.icon)}
                </View>
                <Text style={[styles.badgeName, styles.lockedBadgeName]}>
                  {badge.name}
                </Text>
                <Text style={[styles.badgeDescription, styles.lockedBadgeDescription]}>
                  {badge.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Milestones */}
        <View style={styles.milestonesSection}>
          <Text style={styles.sectionTitle}>Milestones</Text>
          {mockMilestones.map((milestone) => {
            const progress = (milestone.current / milestone.target) * 100;
            
            return (
              <View key={milestone.id} style={styles.milestoneCard}>
                <View style={styles.milestoneHeader}>
                  {getMilestoneIcon(milestone.type)}
                  <View style={styles.milestoneInfo}>
                    <Text style={styles.milestoneDescription}>
                      {milestone.description}
                    </Text>
                    <Text style={styles.milestoneProgress}>
                      {milestone.current} / {milestone.target}
                    </Text>
                  </View>
                  {milestone.achieved && (
                    <Trophy size={24} color={COLORS.success} />
                  )}
                </View>
                
                <View style={styles.milestoneProgressContainer}>
                  <View style={styles.milestoneProgressBar}>
                    <View 
                      style={[
                        styles.milestoneProgressFill,
                        { 
                          width: `${Math.min(progress, 100)}%`,
                          backgroundColor: milestone.achieved ? COLORS.success : COLORS.primary
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.milestoneProgressText}>
                    {progress.toFixed(0)}% complete
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Achievement Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Achievement Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{earnedBadges.length}</Text>
              <Text style={styles.statLabel}>Badges Earned</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {mockMilestones.filter(m => m.achieved).length}
              </Text>
              <Text style={styles.statLabel}>Milestones Hit</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{currentLevel}</Text>
              <Text style={styles.statLabel}>Current Level</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {((earnedBadges.length / mockBadges.length) * 100).toFixed(0)}%
              </Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
          </View>
        </View>

        {/* Motivational Message */}
        <View style={styles.motivationCard}>
          <Trophy size={32} color={COLORS.warning} />
          <Text style={styles.motivationTitle}>Keep It Up!</Text>
          <Text style={styles.motivationText}>
            You're {pointsForNextLevel} points away from reaching Level {currentLevel + 1}. 
            Record a payment or update your budget to earn more points!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  levelCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  levelHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  levelTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  levelSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 4,
  },
  levelProgressContainer: {
    marginBottom: 20,
  },
  levelProgressBar: {
    height: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  levelProgressText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
  levelRewards: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 16,
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  rewardsText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  badgeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  badgeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 80) / 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lockedBadge: {
    opacity: 0.6,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  lockedBadgeIcon: {
    backgroundColor: COLORS.gray,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  lockedBadgeName: {
    color: COLORS.textLight,
  },
  badgeDescription: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 8,
  },
  lockedBadgeDescription: {
    color: COLORS.gray,
  },
  badgeEarned: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: '600',
  },
  milestonesSection: {
    marginBottom: 24,
  },
  milestoneCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  milestoneProgress: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  milestoneProgressContainer: {
    marginTop: 8,
  },
  milestoneProgressBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  milestoneProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  milestoneProgressText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 6,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: (width - 80) / 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  motivationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  motivationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 12,
  },
  motivationText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
});