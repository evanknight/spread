import React, { useState, useEffect } from "react";

interface WeekCountdownProps {
  currentWeek: number;
  firstGameTime: Date;
}

const WeekCountdown: React.FC<WeekCountdownProps> = ({
  currentWeek,
  firstGameTime,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isWeekInProgress, setIsWeekInProgress] = useState<boolean>(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = firstGameTime.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        setIsWeekInProgress(false);
      } else {
        setIsWeekInProgress(true);
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [firstGameTime]);

  if (isWeekInProgress) {
    return (
      <div className="text-gray-600 dark:text-gray-300 mb-4">
        Week {currentWeek} in progress
      </div>
    );
  }

  return (
    <div className="text-gray-600 dark:text-gray-300 mb-4">
      Picks lock in: {timeLeft}
    </div>
  );
};

export default WeekCountdown;
