import * as React from "react";

type Options = {
  active: boolean;
};

const delay = 1000;
const factor = 1.5;
const defaultOptions = { active: true };
/*
 * The call is fired instantly in case a dependency or options.active changes.
 * Then with a factor and an initial delay the callback function is polled.
 */
export default function useBackoffPoll(
  callback: () => Promise<void>,
  dependencies: any[] = [],
  options: Options
) {
  const opts = { ...defaultOptions, ...options };
  const savedCallback = React.useRef<() => Promise<void>>();

  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    let killed = false;

    async function poll(prevDelay: number) {
      if (killed || !opts.active) return;
      await savedCallback.current();
      setTimeout(() => poll(prevDelay * factor), prevDelay * factor);
    }

    poll(delay);

    return () => {
      killed = true;
    };
  }, [...dependencies, opts.active]);
}
