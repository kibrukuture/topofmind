"use client";

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Microphone, Stop, Brain, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { noteFormSchema, type NoteFormValues } from "@/validators/note-form.validator";

type NoteInputSubmit = { text?: string; audio?: Blob };

type NoteInputProps = {
  onSubmit: (input: NoteInputSubmit) => void;
  isProcessing: boolean;
};

type NoteInputRef = { resetForm: () => void };

export const NoteInput = forwardRef<NoteInputRef, NoteInputProps>(function NoteInput(
  { onSubmit, isProcessing },
  ref
) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: { text: "", files: [] },
  });

  const text = form.watch("text");

  useImperativeHandle(ref, () => ({
    resetForm: () => form.reset({ text: "", files: [] }),
  }));

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current?.stop();
    };
  }, []);

  const handleFormSubmit = form.handleSubmit((values: NoteFormValues) => {
    onSubmit({ text: values.text.trim() });
  });

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      onSubmit({ audio: blob });
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <div className="relative">
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="met sarah today at the stripe conference, she is the cto. mentioned they are hiring 50 engineers. needs to follow up in 2 weeks about a partnership. her colleague james wants a demo next monday..."
                    className="min-h-40 resize-none rounded-2xl border-input px-4 py-4 text-sm leading-relaxed placeholder:text-muted-foreground"
                    disabled={isProcessing}
                  />
                </FormControl>
                {text && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => form.setValue("text", "")}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
                    type="button"
                  >
                    <X size={16} />
                  </Button>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="default"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={cn(
              "gap-2 rounded-xl",
              isRecording &&
                "bg-destructive text-destructive-foreground hover:bg-destructive/90 animate-pulse"
            )}
            type="button"
          >
            {isRecording ? (
              <Stop size={16} weight="bold" />
            ) : (
              <Microphone size={16} weight="bold" />
            )}
            {isRecording ? "stop recording" : "voice note"}
          </Button>

          <Button
            variant="default"
            size="default"
            type="submit"
            disabled={!text?.trim() || isProcessing}
            className="flex-1 gap-2 rounded-xl"
          >
            <Brain size={16} weight="bold" />
            {isProcessing ? "processing..." : "process note"}
          </Button>
        </div>
      </form>
    </Form>
  );
});
