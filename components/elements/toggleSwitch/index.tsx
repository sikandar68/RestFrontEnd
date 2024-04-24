
interface IToggleSwitch {
  id?: string | number;
  label?: string;
  checked?: boolean | undefined;
  className?: string;
  onChange: Function;
  [x: string]: any;
  background?: string;
  disabled?: boolean;
}

const ToggleSwitch = ({
  id,
  label,
  checked,
  className,
  onChange,
  background,
  disabled,
  ...rest
}: IToggleSwitch) => {
  return (
    <h1
      
      className={` inline-flex items-center ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      }  ${className}`}
    >
      <button
        type="button"
        className={`relative h-[15px] w-[30px] rounded-[8px] ${
          background ? background : "bg-dark"
        }  ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        {...rest}
      >
        <span
          className={`absolute bg-primary top-0 h-[15px] w-[15px] rounded-full transition-all duration-100 ease-in-out ${
            checked ? "right-0" : "left-0"
          }`}
        ></span>
      </button>
      {label && (
        <label className="text-[12px] mx-1 text-primary-content">
          {label}
        </label>
      )}
    </h1>
  );
};

export default ToggleSwitch;
