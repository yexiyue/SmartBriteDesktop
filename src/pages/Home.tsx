export const Home = () => {
  return (
    <div>
      Home
      {/* <Switch
        isSelected={isLedOpen}
        classNames={{
          base: cn(
            "inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center",
            "justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
            "data-[selected=true]:border-primary"
          ),
          wrapper: "p-0 h-4 overflow-visible",
          thumb: cn(
            "w-6 h-6 border-2 shadow-lg",
            "group-data-[hover=true]:border-primary",
            //selected
            "group-data-[selected=true]:ml-6",
            // pressed
            "group-data-[pressed=true]:w-7",
            "group-data-[selected]:group-data-[pressed]:ml-4"
          ),
        }}
        thumbIcon={({ isSelected, className }) => {
          if (isSelected) {
            return <Lightbulb className={cn(className, "w-3 h-3")} />;
          } else {
            return <LightbulbOff className={cn(className, "w-3 h-3")} />;
          }
        }}
        onValueChange={(value) => {
          if (value) {
            control(id, "open");
          } else {
            control(id, "close");
          }
        }}
      >
        <div className="flex flex-col gap-1">
          <p className="text-medium">{device?.local_name || "未知"}</p>
          <p className="text-tiny text-default-400">{device?.id}</p>
        </div>
      </Switch> */}
    </div>
  );
};
