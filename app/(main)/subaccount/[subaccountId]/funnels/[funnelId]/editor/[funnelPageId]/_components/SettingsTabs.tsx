"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useEditor } from "@/providers/editor/editor-provider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ChevronsLeftRightIcon,
  LucideImageDown,
  AlignVerticalJustifyStart,
  AlignHorizontalJustifyCenterIcon,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyEndIcon,
  AlignHorizontalJustifyStart,
  AlignHorizontalSpaceAround,
  AlignHorizontalSpaceBetween,
  Rows,
  Columns,
} from "lucide-react";

const SettingsTabs = () => {
  const { state, dispatch } = useEditor();

  const onChangeCustomValues = (e: any) => {
    const settingProperty = e.target.id;

    const value = e.target.value;

    const styleObject = {
      [settingProperty]: value,
    };

    dispatch({
      type: "UPDATE_ELEMENT",
      payload: {
        elementDetails: {
          ...state.editor.selectedElement,
          content: {
            ...state.editor.selectedElement.content,
            ...styleObject,
          },
        },
      },
    });
  };

  const onChangeValues = (e: any) => {
    const styleSettings = e.target.id;

    const value = e.target.value;

    const styleObject = {
      [styleSettings]: value,
    };

    dispatch({
      type: "UPDATE_ELEMENT",
      payload: {
        elementDetails: {
          ...state.editor.selectedElement,
          styles: {
            ...state.editor.selectedElement.styles,
            ...styleObject,
          },
        },
      },
    });
  };

  return (
    <Accordion
      type="multiple"
      className="w-full"
      defaultValue={["Typography", "Dimensions", "Decorations", "Flexbox"]}
    >
      <AccordionItem value="Custom" className="px-6 py-0">
        <AccordionTrigger className="hover:no-underline">
          Custom
        </AccordionTrigger>

        <AccordionContent>
          {state.editor.selectedElement.type === "link" &&
            !Array.isArray(state.editor.selectedElement.content) && (
              <div className="flex flex-col gap-2">
                <p className="text-muted-foreground">Link Path</p>

                <Input
                  id="href"
                  placeholder="https:domain.example.com/pathname"
                  onChange={onChangeCustomValues}
                  value={state.editor.selectedElement.content.href}
                />
              </div>
            )}

          {state.editor.selectedElement.type === "image" &&
            !Array.isArray(state.editor.selectedElement.content) && (
              <div className="flex flex-col gap-2">
                <p className="text-muted-foreground">Image src</p>

                <Input
                  id="src"
                  placeholder="image src"
                  onChange={onChangeCustomValues}
                  value={state.editor.selectedElement.content.src}
                />
              </div>
            )}

          {state.editor.selectedElement.type === "video" &&
            !Array.isArray(state.editor.selectedElement.content) && (
              <div className="flex flex-col gap-2">
                <p className="text-muted-foreground">Video src</p>

                <Input
                  id="src"
                  placeholder="Video src"
                  onChange={onChangeCustomValues}
                  value={state.editor.selectedElement.content.src}
                />
              </div>
            )}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="Typography" className="px-6 py-0">
        <AccordionTrigger className="hover:no-underline">
          Typography
        </AccordionTrigger>

        <AccordionContent className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground">Text Align</p>

            <Tabs
              className="w-full"
              value={state.editor.selectedElement.styles.textAlign}
              onValueChange={(e) =>
                onChangeValues({
                  target: {
                    id: "textAlign",
                    value: e,
                  },
                })
              }
            >
              <TabsList className="flex h-fit items-center justify-between gap-4 border bg-transparent">
                <TabsTrigger
                  value="left"
                  className="h-10 w-10 p-0 data-[state=active]:bg-muted"
                >
                  <AlignLeft size={18} />
                </TabsTrigger>

                <TabsTrigger
                  value="right"
                  className="h-10 w-10 p-0 data-[state=active]:bg-muted"
                >
                  <AlignRight size={18} />
                </TabsTrigger>

                <TabsTrigger
                  value="center"
                  className="h-10 w-10 p-0 data-[state=active]:bg-muted"
                >
                  <AlignCenter size={18} />
                </TabsTrigger>

                <TabsTrigger
                  value="justify"
                  className="h-10 w-10 p-0 data-[state=active]:bg-muted"
                >
                  <AlignJustify size={18} />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground">FontFamily</p>

            <Input
              id="DM Sans"
              onChange={onChangeValues}
              value={state.editor.selectedElement.styles.fontFamily}
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground">Color</p>

            <Input
              id="color"
              onChange={onChangeValues}
              value={state.editor.selectedElement.styles.color}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground">Weight</Label>

              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a weight" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="normal">Regular</SelectItem>
                  <SelectItem value="lighter">Light</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground">Size</Label>

              <Input
                id="fontSize"
                placeholder="px"
                onChange={onChangeValues}
                value={state.editor.selectedElement.styles.fontSize}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="Dimensions" className="px-6 py-0">
        <AccordionTrigger className="hover:no-underline">
          Dimensions
        </AccordionTrigger>

        <AccordionContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div>
                <Label className="text-muted-foreground">Height</Label>

                <Input
                  id="height"
                  placeholder="px"
                  onChange={onChangeValues}
                  value={state.editor.selectedElement.styles.height}
                />
              </div>

              <div>
                <Label className="text-muted-foreground">Width</Label>

                <Input
                  placeholder="px"
                  id="width"
                  onChange={onChangeValues}
                  value={state.editor.selectedElement.styles.width}
                />
              </div>
            </div>

            <p>Margin px</p>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <Label className="text-muted-foreground">Top</Label>

                  <Input
                    id="marginTop"
                    placeholder="px"
                    onChange={onChangeValues}
                    value={state.editor.selectedElement.styles.marginTop}
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground">Bottom</Label>

                  <Input
                    placeholder="px"
                    id="marginBottom"
                    onChange={onChangeValues}
                    value={state.editor.selectedElement.styles.marginBottom}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <Label className="text-muted-foreground">Left</Label>

                  <Input
                    id="marginLeft"
                    placeholder="px"
                    onChange={onChangeValues}
                    value={state.editor.selectedElement.styles.marginLeft}
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground">Right</Label>

                  <Input
                    placeholder="px"
                    id="marginRight"
                    onChange={onChangeValues}
                    value={state.editor.selectedElement.styles.marginRight}
                  />
                </div>
              </div>
            </div>

            <p>Padding px</p>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <Label className="text-muted-foreground">Top</Label>

                  <Input
                    id="paddingTop"
                    placeholder="px"
                    onChange={onChangeValues}
                    value={state.editor.selectedElement.styles.paddingTop}
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground">Bottom</Label>

                  <Input
                    placeholder="px"
                    id="paddingBottom"
                    onChange={onChangeValues}
                    value={state.editor.selectedElement.styles.paddingBottom}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <Label className="text-muted-foreground">Left</Label>

                  <Input
                    id="paddingLeft"
                    placeholder="px"
                    onChange={onChangeValues}
                    value={state.editor.selectedElement.styles.paddingLeft}
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground">Right</Label>

                  <Input
                    placeholder="px"
                    id="paddingRight"
                    onChange={onChangeValues}
                    value={state.editor.selectedElement.styles.paddingRight}
                  />
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="Decorations" className="px-6 py-0">
        <AccordionTrigger className="hover:no-underline">
          Decorations
        </AccordionTrigger>

        <AccordionContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Opacity</Label>

            <div className="flex items-center justify-end">
              <small className="p-2">
                {typeof state.editor.selectedElement.styles?.opacity ===
                "number"
                  ? state.editor.selectedElement.styles?.opacity
                  : parseFloat(
                      (
                        state.editor.selectedElement.styles?.opacity || "0"
                      ).replace("%", ""),
                    ) || 0}
                %
              </small>
            </div>

            <Slider
              defaultValue={[
                typeof state.editor.selectedElement.styles?.opacity === "number"
                  ? state.editor.selectedElement.styles?.opacity
                  : parseFloat(
                      (
                        state.editor.selectedElement.styles?.opacity || "0"
                      ).replace("%", ""),
                    ) || 0,
              ]}
              onValueChange={(e: any) => {
                onChangeValues({
                  target: {
                    id: "opacity",
                    value: `${e[0]}%`,
                  },
                });
              }}
              max={100}
              step={1}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Border Radius</Label>

            <div className="flex items-center justify-end">
              <small className="p-2">
                {typeof state.editor.selectedElement.styles?.borderRadius ===
                "number"
                  ? state.editor.selectedElement.styles?.borderRadius
                  : parseFloat(
                      (
                        state.editor.selectedElement.styles?.borderRadius || "0"
                      ).replace("px", ""),
                    ) || 0}
                px
              </small>
            </div>

            <Slider
              defaultValue={[
                typeof state.editor.selectedElement.styles?.borderRadius ===
                "number"
                  ? state.editor.selectedElement.styles?.borderRadius
                  : parseFloat(
                      (
                        state.editor.selectedElement.styles?.borderRadius || "0"
                      ).replace("px", ""),
                    ) || 0,
              ]}
              onValueChange={(e: any) => {
                onChangeValues({
                  target: {
                    id: "borderRadius",
                    value: `${e[0]}px`,
                  },
                });
              }}
              max={100}
              step={1}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Background Color</Label>

            <div className="flex overflow-clip rounded-md border">
              <div
                className="w-12"
                style={{
                  backgroundColor:
                    state.editor.selectedElement.styles.backgroundColor,
                }}
              />

              <Input
                id="backgroundColor"
                className="mr-2 rounded-none border-y-0 border-r-0"
                placeholder="#HFI245"
                onChange={onChangeValues}
                value={state.editor.selectedElement.styles.backgroundColor}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Background Image</Label>

            <div className="flex overflow-clip rounded-md border">
              <div
                className="w-12"
                style={{
                  backgroundImage:
                    state.editor.selectedElement.styles.backgroundImage,
                }}
              />

              <Input
                id="backgroundImage"
                className="mr-2 rounded-none border-y-0 border-r-0"
                placeholder="url()"
                onChange={onChangeValues}
                value={state.editor.selectedElement.styles.backgroundImage}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Image Position</Label>

            <Tabs
              onValueChange={(e) =>
                onChangeValues({
                  target: {
                    id: "backgroundSize",
                    value: e,
                  },
                })
              }
              value={state.editor.selectedElement.styles.backgroundSize?.toString()}
            >
              <TabsList className="flex h-fit items-center justify-between gap-4 rounded-md border bg-transparent">
                <TabsTrigger
                  value="cover"
                  className="h-10 w-10 p-0 data-[state=active]:bg-muted"
                >
                  <ChevronsLeftRightIcon size={18} />
                </TabsTrigger>

                <TabsTrigger
                  value="contain"
                  className="h-10 w-10 p-0 data-[state=active]:bg-muted"
                >
                  <AlignVerticalJustifyCenter size={22} />
                </TabsTrigger>

                <TabsTrigger
                  value="auto"
                  className="h-10 w-10 p-0 data-[state=active]:bg-muted"
                >
                  <LucideImageDown size={18} />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="Flexbox" className="px-6 py-0">
        <AccordionTrigger className="hover:no-underline">
          Flexbox
        </AccordionTrigger>

        <AccordionContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Justify Content</Label>

            <Tabs
              onValueChange={(e) =>
                onChangeValues({
                  target: {
                    id: "justifyContent",
                    value: e,
                  },
                })
              }
              value={state.editor.selectedElement.styles.justifyContent}
            >
              <TabsList className="flex h-fit items-center justify-between gap-4 rounded-md border bg-transparent">
                <TabsTrigger
                  value="space-between"
                  className="h-10 w-10 p-0 data-[state=active]:bg-muted"
                >
                  <AlignHorizontalSpaceBetween size={18} />
                </TabsTrigger>

                <TabsTrigger
                  value="space-evenly"
                  className="h-10 w-10 p-0 data-[state=active]:bg-muted"
                >
                  <AlignHorizontalSpaceAround size={18} />
                </TabsTrigger>

                <TabsTrigger
                  value="center"
                  className="h-10 w-10 p-0 data-[state=active]:bg-muted"
                >
                  <AlignHorizontalJustifyCenterIcon size={18} />
                </TabsTrigger>

                <TabsTrigger
                  value="start"
                  className="h-10 w-10 p-0 data-[state=active]:bg-muted"
                >
                  <AlignHorizontalJustifyStart size={18} />
                </TabsTrigger>

                <TabsTrigger
                  value="end"
                  className="h-10 w-10 p-0 data-[state=active]:bg-muted"
                >
                  <AlignHorizontalJustifyEndIcon size={18} />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Align Items</Label>

            <Tabs
              onValueChange={(e) =>
                onChangeValues({
                  target: {
                    id: "alignItems",
                    value: e,
                  },
                })
              }
              value={state.editor.selectedElement.styles.alignItems}
            >
              <TabsList className="flex h-fit items-center justify-between gap-4 rounded-md border bg-transparent">
                <TabsTrigger
                  value="center"
                  className="h-10 w-10 p-0 data-[state=active]:bg-muted"
                >
                  <AlignVerticalJustifyCenter size={18} />
                </TabsTrigger>

                <TabsTrigger
                  value="normal"
                  className="h-10 w-10 p-0 data-[state=active]:bg-muted"
                >
                  <AlignVerticalJustifyStart size={18} />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2">
            <Input
              id="display"
              type="checkbox"
              className="h-4 w-4"
              placeholder="px"
              onChange={(va) => {
                onChangeValues({
                  target: {
                    id: "display",
                    value: va.target.checked ? "flex" : "block",
                  },
                });
              }}
            />

            <Label className="text-muted-foreground">Flex</Label>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-muted-foreground">Direction</Label>

            <Tabs
              onValueChange={(e) =>
                onChangeValues({
                  target: {
                    id: "flexDirection",
                    value: e,
                  },
                })
              }
              value={state.editor.selectedElement.styles.flexDirection}
            >
              <TabsList className="flex h-fit items-center justify-between gap-4 rounded-md border bg-transparent">
                <TabsTrigger
                  value={"row"}
                  className="h-10 w-10 p-0 data-[state=active]:bg-muted"
                >
                  <Rows size={18} />
                </TabsTrigger>

                <TabsTrigger
                  value={"column"}
                  className="h-10 w-10 p-0 data-[state=active]:bg-muted"
                >
                  <Columns size={18} />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default SettingsTabs;
