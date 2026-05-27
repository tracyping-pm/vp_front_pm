import styles from './styles.less';

const TableLine = ({
  label,
  value,
  labelColor,
}: {
  label: string;
  value: number;
  labelColor?: string;
}) => {
  return (
    <div className={styles.formatter_line}>
      <div
        className={styles.formatter_label}
        style={labelColor ? { color: labelColor } : undefined}
      >
        {label}
      </div>
      <div className={styles.formatter_value}>{value}</div>
    </div>
  );
};

const FormatterTable = ({
  time,
  pendingNum,
  inTransitNum,
  deliveredNum,
}: {
  time: string;
  pendingNum: number;
  inTransitNum: number;
  deliveredNum: number;
}) => {
  return (
    <div className={styles.formatter}>
      <div className={styles.formatter_title}>
        {time} created waybills that are still in a non-terminal state as of
        today
      </div>
      <TableLine
        labelColor="rgba(0, 0, 0, 0.85)"
        label="Non-Terminated Waybills Numbers:"
        value={pendingNum + inTransitNum + deliveredNum}
      />
      {!!pendingNum ? (
        <TableLine label="Pending Waybills Numbers:" value={pendingNum} />
      ) : null}
      {!!inTransitNum ? (
        <TableLine label="In Transit Waybills Numbers:" value={inTransitNum} />
      ) : null}
      {!!deliveredNum ? (
        <TableLine label="Deliverd Waybills Numbers:" value={deliveredNum} />
      ) : null}
    </div>
  );
};

export default FormatterTable;
