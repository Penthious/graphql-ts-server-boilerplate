interface register {
  register: null;
}

interface registerError {
  register: [
    {
      path: string;
      message: string;
    }
  ];
}
