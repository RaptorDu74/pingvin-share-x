import {
  Col,
  createStyles,
  Grid,
  Paper,
  Skeleton,
  Text,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import {
  TbFiles,
  TbLink,
  TbChartBar,
  TbUsers,
  TbEye,
  TbDatabase,
  TbCalendarStats,
} from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import Meta from "../../components/Meta";
import useTranslate from "../../hooks/useTranslate.hook";
import systemService, { SystemStats } from "../../services/system.service";
import { byteToHumanSizeString } from "../../utils/fileSize.util";

const useStyles = createStyles((theme) => ({
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSizes.xs,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[2]
        : theme.colors.gray[6],
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  value: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1,
  },
  icon: {
    color:
      theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 3 : 7],
  },
}));

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  isLoading: boolean;
}

const StatCard = ({ label, value, icon: Icon, isLoading }: StatCardProps) => {
  const { classes } = useStyles();

  return (
    <Paper withBorder className={classes.card}>
      <Icon size={24} className={classes.icon} />
      <Text className={classes.label}>{label}</Text>
      {isLoading ? (
        <Skeleton height={28} width={80} mt={4} />
      ) : (
        <Text className={classes.value}>{value}</Text>
      )}
    </Paper>
  );
};

const Stats = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslate();

  useEffect(() => {
    systemService
      .getStats()
      .then(setStats)
      .finally(() => setIsLoading(false));
  }, []);

  const cards = [
    {
      label: t("admin.stats.totalShares"),
      value: stats?.totalShares ?? 0,
      icon: TbLink,
    },
    {
      label: t("admin.stats.activeShares"),
      value: stats?.activeShares ?? 0,
      icon: TbChartBar,
    },
    {
      label: t("admin.stats.sharesLast7Days"),
      value: stats?.sharesLast7Days ?? 0,
      icon: TbCalendarStats,
    },
    {
      label: t("admin.stats.sharesLast30Days"),
      value: stats?.sharesLast30Days ?? 0,
      icon: TbCalendarStats,
    },
    {
      label: t("admin.stats.totalFiles"),
      value: stats?.totalFiles ?? 0,
      icon: TbFiles,
    },
    {
      label: t("admin.stats.totalUsers"),
      value: stats?.totalUsers ?? 0,
      icon: TbUsers,
    },
    {
      label: t("admin.stats.totalViews"),
      value: stats?.totalViews ?? 0,
      icon: TbEye,
    },
    {
      label: t("admin.stats.totalSize"),
      value: stats ? byteToHumanSizeString(stats.totalSize) : "0 B",
      icon: TbDatabase,
    },
  ];

  return (
    <>
      <Meta title={t("admin.stats.title")} />
      <Title mb={30} order={3}>
        <FormattedMessage id="admin.stats.title" />
      </Title>
      <Grid>
        {cards.map((card) => (
          <Col xs={12} sm={6} md={3} key={card.label}>
            <StatCard
              label={card.label}
              value={card.value}
              icon={card.icon}
              isLoading={isLoading}
            />
          </Col>
        ))}
      </Grid>
    </>
  );
};

export default Stats;
