import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import Button from "./Button";

// 1️⃣ Storybook metadata
export default {
  title: "UI/Button",   // Storybook sol menüde görünecek başlık
  component: Button,    // Hangi component’in story’si
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "danger"], // Button prop seçenekleri
    },
    children: { control: "text" }, // Button içindeki yazıyı değiştirebilmek için
  },
} as Meta;

// 2️⃣ Template oluşturma
const Template: StoryFn<any> = (args) => <Button {...args} />;

// 3️⃣ Farklı story’leri oluştur
export const Primary = Template.bind({});
Primary.args = {
  variant: "primary",
  children: "Primary Button",
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: "secondary",
  children: "Secondary Button",
};

export const Danger = Template.bind({});
Danger.args = {
  variant: "danger",
  children: "Danger Button",
};