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
  status,
  errors,
}: {
  status: number;
  errors: Array<{ path: string; message: any }>;
}): object => {
  return {
    status,
    errors,
  };
};
