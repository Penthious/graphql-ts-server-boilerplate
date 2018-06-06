export const outputSuccess = ({
  path,
  message,
  status,
}: {
  path: string;
  message: any;
  status: number;
}): object[] => {
  return [
    {
      status,
      path,
      message,
    },
  ];
};

export const outputError = ({
  path,
  message,
  status,
}: {
  path: string;
  message: any;
  status: number;
}): object[] => {
  return [
    {
      status,
      path,
      message,
    },
  ];
};
